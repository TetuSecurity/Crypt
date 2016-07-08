const fs = require('fs');
const path = require('path');
const storedir = (global.config.FileStore || {Directory: path.join(__dirname,'../../files')}).Directory;


function store_data(filename, totalsize, data, callback){
  const storepath = path.join(storedir,filename);
  var currsize = 0;
  try{
    currsize= fs.statSync(storepath).size;
  }
  catch(e){
    if(e.code == 'ENOENT'){
      currsize = 0;
    }
    else{
      return callback(e, currsize);
    }
  }
  if(currsize === totalsize){
    return callback(null, totalsize);
  }
  fs.appendFile(storepath, new Buffer(data, 'hex'), function(err){
    if(err){
      return callback(err, currsize);
    }
    currsize = fs.statSync(storepath).size;
    return callback(null, currsize);
  });
}

module.exports = store_data;
