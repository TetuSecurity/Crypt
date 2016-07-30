import { Injectable } from '@angular/core';
import {createHash, randomBytes, createCipher, createDecipher, pbkdf2} from 'crypto';

@Injectable()
export class EncryptionService {
  constructor(){}

  hash(data:string):string{
    var hash = createHash('sha512');
    hash.update(data);
    return hash.digest('base64');
  }

  encrypt(data, key){
    var cipher = createCipher('aes256', key);
    var encdata = cipher.update(data, null, 'base64');
    encdata += cipher.final('base64');
    return encdata;
  }

  encryptUpload(data, password){
    if(!Buffer.isBuffer(data)){
      data= new Buffer(data);
    }
    var rkey = randomBytes(256);
    var cipher = createCipher('aes256', rkey);
    var encdata = cipher.update(data, null, 'base64');
    encdata += cipher.final('base64');
    var kcipher = createCipher('aes256', password);
    var enckey = kcipher.update(rkey, null, 'base64');
    enckey += kcipher.final('base64');
    return {Data: encdata, Key: enckey};
  }

  decrypt(enc, key){
    var data;
    try{
      var datadecipher = createDecipher('aes256', key);
      data = datadecipher.update(enc, 'base64');
      data =  Buffer.concat([data, datadecipher.final()]);
    }
    return data;
  }

  decryptDownload(encobj, password){
    var keydecipher = createDecipher('aes256', password);
    var key = keydecipher.update(encobj.Key, 'base64');
    key = Buffer.concat([key, keydecipher.final()]);
    var datadecipher = createDecipher('aes256', key);
    var data = datadecipher.update(encobj.Data, 'base64');
    data =  Buffer.concat([data, datadecipher.final()]);
    return data;
  }

  generateKey(password, salt):Promise<string>{
    var that = this;
    return new Promise(function(resolve, reject){
      pbkdf2(password, salt, 1000, 512, 'sha512', function(err, key){
        if(err){
          return reject(err);
        }
        else{
          return resolve(key);
        }
      });
    });
  }

}
