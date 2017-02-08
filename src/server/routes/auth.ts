import { Router } from 'express';
import * as uuidv4 from 'uuid/v4';
import * as crypto from 'crypto';
const router = Router();


module.exports = (APP_CONFIG) => {
    const pool = APP_CONFIG.db.createPool();
    const email = APP_CONFIG.emailer;

    router.get('/', (req, res) => {
        if (res.locals.user) {
            return res.send({ User: res.locals.user });
        } else {
            return res.status(401).send({ Error: 'Unauthenticated!' });
        }
    });

    router.post('/signup', (req, res) => {
        let body = req.body;
        if (!body || !body.Email) {
            return res.status(400).send({ Error: 'No info provided' });
        }
        let confirmation = uuidv4();
        pool.getConnection((err, conn) => {
            if (err) {
                console.log('Error connecting to database', err);
                return res.status(500).send({ Error: 'Internal Server Error' });
            }
            conn.beginTransaction((transerr) => {
                if (transerr) {
                    console.log('Error beginning signup transaction', transerr);
                    conn.release();
                    return res.status(500).send({ Error: 'Internal Server Error' });
                }
                let iq = 'Insert into `users` (`Email`, `Confirm`, `Active`) VALUES (?, ?, 0);';
                conn.query(iq, [body.Email, confirmation], (qerr) => {
                    if (qerr) {
                        if (qerr.code === 'ER_DUP_KEY' || qerr.code === 'ER_DUP_ENTRY') {
                            conn.rollback(() => {
                                conn.release();
                                return res.status(400).send({ Error: 'User with that email already exists!' });
                            });
                        } else {
                            conn.rollback(() => {
                                console.log(qerr);
                                conn.release();
                                return res.status(500).send({ Error: 'Internal Server Error' });
                            });
                        }
                    } else {
                        let confirmHash = crypto.createHmac('sha512', APP_CONFIG.verification_key)
                            .update(confirmation)
                            .digest('hex');
                        let confirmLink = `${req.protocol}://${req.hostname}/confirm/${confirmation}/${confirmHash}`;
                        console.log(confirmLink);
                        let to: string = body.Email;
                        email.confirm_email(to, confirmLink, (emailerr) => {
                            if (emailerr) {
                                conn.rollback(() => {
                                    console.log('Error sending confirmation email', emailerr);
                                    conn.release();
                                    return res.status(500).send({ Error: 'Internal Server Error' });
                                });
                            } else {
                                conn.commit((cerr) => {
                                    if (cerr) {
                                        conn.rollback(() => {
                                            console.log(cerr);
                                            conn.release();
                                            return res.status(500).send({ Error: 'Internal Server Error' });
                                        });
                                    } else {
                                        conn.release();
                                        return res.send({ Success: true });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });

    router.post('/register/:confirmKey/:confirmHash', (req, res) => {
        let params = req.params;
        let confirmHash = params.confirmHash;
        let attempt = crypto.createHmac('sha512', APP_CONFIG.verification_key)
            .update(params.confirmKey)
            .digest('hex');
        if (confirmHash !== attempt) {
            return res.status(400).send('Could not verify confirmation link!');
        } else {
            // look up user by confirm, and verify that the user has not already been initialized
            pool.getConnection((err, conn) => {
                if (err) {
                    console.log('Error connecting to database', err);
                    return res.status(500).send({ Error: 'Internal Server Error' });
                }
                conn.beginTransaction((transerr) => {
                    if (transerr) {
                        console.log('Error beginning transaction', transerr);
                        return res.status(500).send({ Error: 'Internal Server Error' });
                    }
                    // Also check that email in body with email matches that attached to confirm key
                    let q = 'Select `ID` from `Users` where `Confirm`=? and `Email`=? and `Active`=0;';
                    let args = [params.confirmKey, req.body.Email];
                    conn.query(q, args, (qerr, results) => {
                        if (qerr)  {
                            conn.rollback(() => {
                                console.log('Error fetching users by confrim', qerr);
                                conn.release();
                                return res.status(500).send({ Error: 'Internal Server Error' });
                            });
                        } else {
                            if (results && results.length && results.length > 0) {
                                // begin CHAP registration
                            } else {
                                conn.rollback(() => {
                                    console.log(`No matching users found for confirm:${params.confirmKey} and Email:${req.body.Email}`);
                                    conn.release();
                                    return res.status(500).send({ Error: 'Internal Server Error' });
                                });
                            }
                        }
                    });
                });
            });
        }
    });

    return router;
};
