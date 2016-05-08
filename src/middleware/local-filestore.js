const fs = require('fs');
const path = require('path');
const storedir = (global.config.FileStore || {Directory: path.join(__dirname,'../../files')}).Directory;

module.exports = {
  store: function(fileid, datastream, callback){
    const outfile = fs.createWriteStream(path.join(storedir, fileid+'.enc'));
    var out = datastream.pipe(outfile);
    out.once('error', function(err){
      return callback(err);
    });
    out.once('close', function(){
      return callback();
    });
  },
  get: function(fileid){
    const infile = fs.createReadStream(path.join(storedir, fileid+'.enc'));
    return infile;
  }
};
