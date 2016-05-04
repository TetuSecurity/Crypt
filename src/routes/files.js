const router = require('express').Router();
const uuid = require('node-uuid');
const path = require('path');
const fs = require('fs');
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
  var body = req.body;
  var fileid = req.params.fileid;
  if(!body || !body.Data){
    return res.send({Success: false, Error: 'Missing File Data!'});
  }
  // get path and storage type from config
  // default to project root/files
  db.query('Select * from `filemetadata` where `Owner`=? and `FileID`=?;', [res.locals.user.ID, req.params.fileid], function(err, results){
    if(err){
      console.log('Error validating file id', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    if(results.length<1){
      return res.send({Success: false, Error: 'No such file ID'});
    }
    store(results[0].Filename, results[0].Size, body.Data, function(err, currsize){
      if(err){
        console.log(err);
      }
      return res.send({Success: !(!!err), LastByte:currsize, Error: err});
    });
  });
});

module.exports = router;
