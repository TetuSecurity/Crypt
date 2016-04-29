const router = require('express').Router();
const uuid = require('node-uuid');
const path = require('path');
const fs = require('fs');
const db = require('../middleware/db');


/**
* Saves Metadata of a file and returns a new endpoint for content upload
**/
router.put('/upload/', function(req, res){
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
  if(!body || !body.Data || (!('Place' in body)) || (!('Total' in body)) ){
    return res.send({Success: false, Error: 'Missing information about file'});
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
    var storepath = path.join(__dirname,'../../files', results[0].Filename);
    fs.appendFile(storepath, new Buffer(body.Data, 'hex'), function(err){
      if(err){
        console.log(err);
        return res.send({Success: false, Nack:body.Place, Error:err, Done:false});
      }
      var done = (body.Place===body.Total-1);
      if(done){
        console.log('Upload Complete for', results[0].Filename);
      }
      return res.send({Success: true, Ack:body.Place, Done:done});
    });
  });
});

module.exports = router;
