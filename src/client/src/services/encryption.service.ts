import { Injectable } from '@angular/core';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  constructor(){}

  hash(data:string):string{
    var hash = crypto.createHash('sha512');
    hash.update(data);
    return hash.digest('base64');
  }

  encrypt(data, password){
    if(!Buffer.isBuffer(data)){
      data= new Buffer(data);
    }
    var rkey = crypto.randomBytes(256);
    var cipher = crypto.createCipher('aes256', rkey);
    var encdata = cipher.update(data, null, 'base64');
    encdata += cipher.final('base64');
    var kcipher = crypto.createCipher('aes256', password);
    var enckey = kcipher.update(rkey, null, 'base64');
    enckey += kcipher.final('base64');
    return {Data: encdata, Key: enckey};
  }

  decrypt(encobj, password){
    var keydecipher = crypto.createDecipher('aes256', password);
    var key = keydecipher.update(encobj.Key, 'base64');
    key = Buffer.concat([key, keydecipher.final()]);
    var datadecipher = crypto.createDecipher('aes256', key);
    var data = datadecipher.update(encobj.Data, 'base64');
    data =  Buffer.concat([data, datadecipher.final()]);
    return data;
  }

  generateKey(password, salt):Promise<string>{
    var that = this;
    return new Promise(function(resolve, reject){
      crypto.pbkdf2(password, salt, 25000, 512, 'sha512', function(err, key){
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
