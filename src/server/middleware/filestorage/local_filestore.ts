import {
    createReadStream,
    createWriteStream,
    ReadStream
} from 'fs';
import {join} from 'path';
import {FileStore} from './base';

export class LocalFileStore implements FileStore {

    private storeDir: string;

    constructor() {
        this.storeDir = process.env.FILE_LOCATION || join(__dirname, './files');
    }

    store(fileid: any, datastream: ReadStream, callback) {
        const outfile = createWriteStream(join(this.storeDir, `${fileid}.enc`));
        let out = datastream.pipe(outfile);
        out.once('error', function(err){
            return callback(err);
        });
        out.once('close', function(){
            return callback();
        });
    }

    get(fileid: any): ReadStream {
        const infile = createReadStream(join(this.storeDir, `${fileid}.enc`));
        return infile;
    }
}
