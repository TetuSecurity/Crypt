import {Observable} from 'rxjs/Rx';
import {INode, File, Directory} from '../../models/files';
import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class FilesService {
    private BASE_URL = '/api/files/';

    constructor(
        private _http: Http
    ) {
    }

    getFiles(parentDirId?: number): Observable<INode[]> {
        let url = this.BASE_URL;
        if (parentDirId) {
            url += parentDirId;
        } else {
            url += '-1';
        }
        return this._http.get(url)
            .map(res => res.json())
            .map(node => (node.Files || []).map(inode => this.mapInode(inode)));
    }

    newFolder(dirname: string, parentId: number): Observable<Directory> {
        return this._http.post(this.BASE_URL, { Name: name, Parent: parentId })
        .map(res => res.json())
        .map(body => this.mapInode(body.Directory));
    }

    mapInode(inode: INode): File|Directory {
        inode.IsDirectory = !(inode.FileID);
        return inode;
    }
}
