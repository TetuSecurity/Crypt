const router = require('express').Router();
const uuid = require('node-uuid');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');
const db = require('../middleware/db');


var store;

if(global.config.FileStore && global.config.FileStore.Type=='S3'){
  store = require('../middleware/s3-filestore');
}
else{
  store = require('../middleware/local-filestore');
}

/**
* Saves Metadata of a file and returns a new endpoint for content upload
**/
router.put('/upload/', global.jsonParser, function(req, res){
  var body = req.body;
  if(!body || !body.Filename || !body.Size){
    return res.send({Success: false, Error: 'No filename!'});
  }
  var fileid = uuid.v4();
  db.query('Insert into `filemetadata` (`FileID`, `Filename`, `Owner`, `Size`) VALUES (?, ?, ?, ?);', [fileid, body.Filename, res.locals.user.ID, body.Size], function(err, result){
    if(err){
      console.log('Error saving file metadata', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    console.log('Beginning upload of', body.Filename);
    return res.send({Success: true, EndpointID: fileid});
  });
});

router.put('/upload/:fileid', function(req, res){
  var fileid = req.params.fileid;
  db.query('Select * from `filemetadata` where `Owner`=? and `FileID`=?;', [res.locals.user.ID, fileid], function(err, results){
    if(err){
      console.log('Error validating file id', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    if(results.length<1){
      return res.send({Success: false, Error: 'No such file ID'});
    }
    const cipher = crypto.createCipher('aes256', new Buffer(global.config.StorageKey, 'base64'));
    var pl = req.pipe(zlib.createGzip()).pipe(cipher);
    store.store(fileid, pl, function(err){
      if(err){
        return res.send({Success: false, Error: err});
      }
        return res.send({Success: true});
    });
  });
});

router.get('/:fileid', function(req, res){
  var fileid = req.params.fileid;
  db.query('Select * from `filemetadata` where `Owner`=? and `FileID`=?;', [res.locals.user.ID, fileid], function(err, results){
    if(err){
      console.log('Error validating file id', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    if(results.length<1){
      return res.send({Success: false, Error: 'No such file ID'});
    }
    const decipher = crypto.createDecipher('aes256', new Buffer(global.config.StorageKey, 'base64'));
    store.get(fileid).pipe(decipher).pipe(zlib.createGunzip()).pipe(res).once('close', function(){
      return res.end();
    });
  });
});

module.exports = router;
