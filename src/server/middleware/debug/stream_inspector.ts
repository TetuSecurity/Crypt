import {Transform} from 'stream';

export class Inspector extends Transform{
  constructor(options) {
    super(options);
    Transform.call(Inspector, Transform);
  }

  _transform(chunk, enc, cb){
    if (Buffer.isBuffer(chunk)){
      console.log(chunk.toString('utf8'));
    } else {
      console.log(chunk);
    }
    this.push(chunk);
    cb();
  }
}
