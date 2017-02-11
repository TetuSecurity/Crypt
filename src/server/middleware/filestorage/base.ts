import { ReadStream } from 'fs';
export interface FileStore {

    store(fileid: any, input: ReadStream, callback: (err?: any) => any): any;
    get(fileid: any): ReadStream;
}
