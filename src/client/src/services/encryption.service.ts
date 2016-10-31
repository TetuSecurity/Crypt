import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { createHash, randomBytes, createCipher, createDecipher, pbkdf2 } from 'crypto';

@Injectable()
export class EncryptionService {
  constructor() { }

  generateRandom(length: number): string {
    return randomBytes(length).toString('base64');
  }

  hash(data: string): string {
    let hash = createHash('sha512');
    hash.update(data);
    return hash.digest('base64');
  }

  encrypt(data: Buffer, key: Buffer | string): string {
    let cipher = createCipher('aes256', key);
    let encdata = cipher.update(data, null, 'base64');
    encdata += cipher.final('base64');
    return encdata;
  }

  encryptUpload(data, password) {
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }
    let rkey = randomBytes(256);
    let cipher = createCipher('aes256', rkey);
    let encdata = cipher.update(data, null, 'base64');
    encdata += cipher.final('base64');
    let kcipher = createCipher('aes256', password);
    let enckey = kcipher.update(rkey, null, 'base64');
    enckey += kcipher.final('base64');
    return { Data: encdata, Key: enckey };
  }

  decrypt(enc: string, key: Buffer | string): Buffer {
    let data;
    try {
      let datadecipher = createDecipher('aes256', key);
      data = datadecipher.update(enc, 'base64');
      data = Buffer.concat([data, datadecipher.final()]);
    } catch (e) {
      console.log('Decryption error: ', e);
      data = undefined;
    } finally {
      return data;
    }
  }

  decryptDownload(encobj, password) {
    let keydecipher = createDecipher('aes256', password);
    let key = keydecipher.update(encobj.Key, 'base64');
    key = Buffer.concat([key, keydecipher.final()]);
    let datadecipher = createDecipher('aes256', key);
    let data = datadecipher.update(encobj.Data, 'base64');
    data = Buffer.concat([data, datadecipher.final()]);
    return data;
  }

  generateKey(password, salt): Observable<string> {
    return Observable.create((x: Observer<string>) => {
      pbkdf2(password, salt, 1000, 512, 'sha512', function (err, key) {
        if (err) {
          console.log('error:', err);
          return x.error(err);
        }
        return x.next(key.toString('base64'));
      });
    });
  }

  setupKeys(encResponse: string, nonce: string, password: string, callback) {
    let plainResponse = this.decrypt(encResponse, nonce);
    if (!plainResponse) {
      return callback('Could not decrypt response with nonce');
    } else {
      this.generateKey(password, password).subscribe((key) => {
        let recoveryKey = this.generateRandom(256);
        let pwdChallenge = this.encrypt(new Buffer(plainResponse.toString('base64'), 'base64'), key);
        let rstChallenge = this.encrypt(new Buffer(plainResponse.toString('base64'), 'base64'), recoveryKey);
        return callback(null, { Password: { Key: key, Challenge: pwdChallenge }, Reset: { Key: recoveryKey, Challenge: rstChallenge } });
      });
    }

  }

}
