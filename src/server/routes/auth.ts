import { Router } from 'express';
import {
    MysqlDatabase,
    EmailService
} from '../middleware';
import * as crypto from 'crypto';
import * as uuidv4 from 'uuid/v4';

const router = Router();
const db = new MysqlDatabase();
const email = new EmailService();
const pool = db.createPool();

module.exports = (APP_CONFIG) => {

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
                            conn.rollback(function () {
                                conn.release();
                                return res.status(400).send({ Error: 'User with that email already exists!' });
                            });
                        } else {
                            conn.rollback(function () {
                                console.log(qerr);
                                conn.release();
                                return res.status(500).send({ Error: 'Internal Server Error' });
                            });
                        }
                    } else {
                        let confirmLink = `${req.protocol}://${req.hostname}/auth/confirm/${confirmation}`;
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

    return router;
};
