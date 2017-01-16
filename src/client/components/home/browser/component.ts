import {Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FilesService} from '../../../services/files/service';
import {INode, File, Directory, SortConfig} from '../../../models/files';

@Component({
    selector: 'file-browser',
    template: require('./template.html'),
    styles: [require('./styles.scss')]
})
export class BrowserComponent implements OnInit {
    private files: INode[];
    private currentSort: SortConfig = {};
    private breadcrumbs: Directory[] = [];
    private currentView: number = -1;

    constructor(
        private router: Router,
        private _filesService: FilesService
    ) {}

    ngOnInit() {
        this.files = [];
        this.sortBy('ModifiedDT');
        this._filesService.getFiles()
        .subscribe(res => {
            this.files = res;
            this.currentView = -1;
            this.sortBy('ModifiedDT');
        });
    }

    sortBy(field: string) {
        if (this.currentSort.Field && this.currentSort.Field === field) {
            this.currentSort.ASC = !this.currentSort.ASC;
        } else {
            this.currentSort = { Field: field, ASC: true };
        }
        let mult: number = (this.currentSort.ASC ? 1 : -1);
        this.files.sort((a: INode, b: INode) => {
            if (a.IsDirectory === b.IsDirectory) {
                if (a[field] < b[field]) {
                    return -1 * mult;
                } else if (a[field] > b[field]) {
                    return 1 * mult;
                } else {
                    return 0 * mult;
                }
            } else {
                if (b.IsDirectory) {
                    return 1;
                } else {
                    return -1;
                }
            }
        });
    }

    diveIn(folder: INode) {
        if (!folder.IsDirectory) {
            return;
        }
        this.breadcrumbs.push(folder);
        this._filesService.getFiles(folder.ID)
        .subscribe(files => {
            this.files = files;
        });
    }

    navigateTo(location: Directory) {
        let pid;
        if (!location) {
            this.breadcrumbs = [];
            pid = null;
        } else {
            let i = this.breadcrumbs.indexOf(location);
            if (i >= 0) {
                this.breadcrumbs = this.breadcrumbs.slice(0, i + 1);
            }
            pid = location.ID;
        }
        this._filesService.getFiles(pid)
        .subscribe(files => this.files = files);
    }

    // downloadFile(file: File) {
    //     //fetch file by ID
    //     //if file is shared, prompt for shared key
    //     let enccontents;
    //     let filecontents = this.encSvc.decrypt(enccontents, this.authSvc.key);
    // }

    // uploadFile(file: File) {
    //     //send post to get fileid
    //     let contents;
    //     let encobj = this.encSvc.encrypt(contents, this.authSvc.key);
    //     //stream encobj.Data
    //     //stream encobj.Key
    //     //refresh browser
    // }
}
