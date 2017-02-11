import {Router} from 'express';
const router = Router();

module.exports = (APP_CONFIG) => {
    const pool = APP_CONFIG.db.createPool();

    router.use((req, res, next) => {
        if (!req.signedCookies || !req.signedCookies[APP_CONFIG.cookie_name]) {
            res.locals.user = null;
            return next();
        } else {
            let a_sess = req.signedCookies[APP_CONFIG.cookie_name];
            pool.getConnection((err, conn) => {
                if (err) {
                    return res.status(500).send({Error: 'Could not establish a connection to the database'});
                } else {
                    let q = 'Select `users`.* from `sessions` join `users` on `users`.`ID` = `sessions`.`User_ID` Where `Session_ID`=? and `Expires`>?;';
                    let now = Math.floor(new Date().getTime() / 1000);
                    conn.query(q, [a_sess, now], (qerr, results) => {
                        if (qerr) {
                            console.log('Error connecting to auth service');
                            return res.send({Success: false, Error: 'Could not retrieve session'});
                        }
                        if (results.length < 1) {
                            res.locals.user = null;
                            return next();
                        } else {
                            res.locals.user = results[0];
                            delete res.locals.user.PasswordHash;
                            delete res.locals.user.Salt;
                            delete res.locals.user.Confirm;
                            return next();
                        }
                    });
                }
            });
        }
    });

    router.use('/auth', require('./auth')(APP_CONFIG));

    router.use((req, res, next) => {
        // if (!res.locals.user) {
        //     return res.status(401).send({Error: 'Unauthenticated!'});
        // } else {
        //     return next();
        // }
        res.locals.user = {ID: 1};
        return next();
    });

    router.use('/files', require('./files')(APP_CONFIG));

    return router;
};
