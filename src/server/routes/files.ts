import { Router } from 'express';
import * as uuidv4 from 'uuid/v4';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { MysqlDatabase, LocalFileStore } from '../middleware';

const router = Router();
const db = new MysqlDatabase();
const pool = db.createPool();
const store = new LocalFileStore();

module.exports = (APP_CONFIG) => {

    /**
    * Saves Metadata of a file and returns a new endpoint for content upload
    **/
    router.put('/upload/', function (req, res) {
        let body = req.body;
        if (!body || !body.Filename || !body.Size) {
            return res.send({ Success: false, Error: 'No filename!' });
        }
        let fileid = uuidv4();
        pool.getConnection((err, conn) => {
            if (err) {
                console.log(err);
                return res.status(500).send({Error: 'Could not establish connection to database'});
            } else {
                let q = 'Insert into `filemetadata` (`FileID`, `Filename`, `Owner`, `Size`) VALUES (?, ?, ?, ?);';
                let args = [fileid, body.Filename, res.locals.user.ID, body.Size];
                conn.query(q, args, (qerr, result) => {
                    conn.release();
                    if (qerr) {
                        console.log('Error saving file metadata', qerr);
                        return res.status(500).send({ Error: 'Internal Server Error' });
                    }
                    console.log('Beginning upload of', body.Filename);
                    return res.send({ EndpointID: fileid });
                });
            }
        });
    });

    router.put('/upload/:fileid', (req, res) => {
        let fileid = req.params.fileid;
        pool.getConnection((err, conn) => {
            if (err) {
                console.log('error connecting to database');
                return res.status(500).send({Error: 'Error establishing connection to database'});
            }
            let q = 'Select * from `filemetadata` where `Owner`=? and `FileID`=?;';
            let args = [res.locals.user.ID, fileid];
            conn.query(q, args, (qerr, results) => {
                conn.release();
                if (qerr) {
                    console.log('Error validating file id', qerr);
                    return res.status(500).send({ Error: 'Internal Server Error' });
                }
                if (results.length < 1) {
                    return res.send(404).send({ Error: 'No such file ID' });
                }
                const cipher = crypto.createCipher('aes256', new Buffer(APP_CONFIG.storage_key, 'base64'));
                let pl = req.pipe(zlib.createGzip()).pipe(cipher);
                store.store(fileid, pl, function (perr) {
                    if (perr) {
                        return res.status(500).send({ Error: perr });
                    }
                    return res.send({ Success: true });
                });
            });
        });
    });

    router.get('/download/:fileid', (req, res) => {
        let fileid = req.params.fileid;
        pool.getConnection((err, conn) => {
            if (err) {
                console.log(err);
                return res.status(500).send({Error: 'Error establishing connection to database'});
            }
            let q = 'Select * from `filemetadata` where `Owner`=? and `FileID`=?;';
            let args = [res.locals.user.ID, fileid];
            conn.query(q, args, (qerr, results) => {
                conn.release();
                if (qerr) {
                    console.log('Error validating file id', qerr);
                    return res.status(500).send({ Error: 'Internal Server Error' });
                }
                if (results.length < 1) {
                    return res.status(404).send({ Error: 'No such file ID' });
                }
                const decipher = crypto.createDecipher('aes256', new Buffer(APP_CONFIG.storage_key, 'base64'));
                store.get(fileid).pipe(decipher).pipe(zlib.createGunzip()).pipe(res).once('close', () => res.end());
            });
        });
    });

    router.get('/:parentid', (req, res) => {
        let pid = req.params.parentid;
        pool.getConnection((err, conn) => {
            if (err) {
                console.log(err);
                return res.status(500).send({Error: 'Error establishing connection to database'});
            }
            let q = 'Select * from `filemetadata` where `Owner`=? and `Parent`=?;';
            let args = [res.locals.user.ID, pid];
            if (!pid || pid < 1) {
                q = 'Select * from `filemetadata` where `Owner`=? and `Parent`=(Select `ID` from `filemetadata` where `Owner`=? and `Parent`=-1 LIMIT 1);';
                args = [res.locals.user.ID, res.locals.user.ID];
            }
            conn.query(q, args, (qerr, files) => {
                conn.release();
                if (qerr) {
                    return res.status(500).send({ Error: qerr });
                }
                return res.send({ Files: files });
            });
        });

    });

    router.post('/', (req, res) => {
        let body = req.body;
        if (!body.Name || !body.Parent) {
            return res.status(400).send({ Error: 'Missing required fields' });
        }
        pool.getConnection((err, conn) => {
            if (err) {
                console.log(err);
                return res.status(500).send({Error: 'Error establishing connection to database'});
            }
            let q = 'Insert into `filemetadata` (`Name`, `Owner`, `Parent`) VALUES(?,?,?);';
            let args = [body.Name, res.locals.user.ID, body.Parent];
            if (body.Parent < 1) {
                q = 'Insert into `filemetadata` (`Name`, `Owner`, `Parent`) Select ?, ?, `ID` from `filemetadata` where `Owner`=? and `Parent`=-1 LIMIT 1;';
                args = [body.Name, res.locals.user.ID, res.locals.user.ID];
            }
            conn.query(q, args, function (qerr, result) {
                if (qerr) {
                    conn.release();
                    if (qerr.code === 'ER_DUP_KEY') {
                        return res.status(400).send({ Error: 'A directory with that name already exists this context' });
                    }
                    console.log('Error adding new directory', qerr);
                    return res.status(500).send({ Error: 'Internal Server Error' });
                }
                let fid = result.insertId;
                conn.query('Select * from `filemetadata` where `ID`=?;', [fid], (qerr2, results) => {
                    conn.release();
                    if (qerr2) {
                        console.log(qerr2);
                        return res.status(500).send({ Error: 'Internal Server Error' });
                    }
                    if (results.length < 1) {
                        console.log('Error retreiving newly added row');
                        return res.status(500).send({Error: 'Internal Server Error' });
                    }
                    return res.send({ Directory: results[0] });
                });
            });
        });
    });

    return router;
};
