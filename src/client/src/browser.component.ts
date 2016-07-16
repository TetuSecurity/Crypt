import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AuthService } from './services/auth.service';
import { EncryptionService } from './services/encryption.service';

export class File{
  Name: string;
  ID: number;
  Parent:Directory;
  LastModified: Date;
  IsDirectory: boolean = false;
  constructor(fileobj){
    this.Name = fileobj.Name;
    this.LastModified = fileobj.ModifiedDT; // new Date(Date.parse(fileobj.ModifiedDT.replace('-','/','g')));
    this.ID = fileobj.ID;
    this.IsDirectory = !fileobj.FileID;
  }
}

export class Directory extends File{
  IsDirectory:boolean = true;
  constructor(fileobj){
    super(fileobj);
  }
}

function mapFiles(ifile):File{
  if(ifile['FileID']){
    return new File(ifile);
  }
  else{
    return new Directory(ifile);
  }
}

@Component({
  selector: 'file-browser',
  templateUrl: 'templates/browser.component.html'
})
export class BrowserComponent implements OnInit{
  files: File[];
  currentSort = {
    Field:undefined,
    ASC:undefined
  };
  breadcrumbs:Directory[] = [];
  currentView:number = -1;
  adding:boolean = false;
  newFolderName:string ='';

  constructor(
    private http: Http,
    private authSvc:AuthService,
    private encSvc:EncryptionService
  ) {
    this.files = [];
    this.sortBy('LastModified');
    var that = this;
    this.getFiles(null, function(err, data:Array<Object>){
      if(err){
        console.log(err);
      }
      else{
        that.files=data.map(mapFiles);
        that.sortBy('LastModified');
      }
    });
  }

  ngOnInit(){
    this.authSvc.checkCreds();
  }

  getFiles(parentID:number, callback){
    var that = this;
    var url = '/api/files/';
    if(parentID){
      url+=parentID;
    }
    else{
      url += '-1';
    }
    this.http.get(url).subscribe(function(res: Response){
      let body = res.json();
      if(body.Success){
        that.currentView = parentID||-1;
        return callback(null, body.Files);
      }
      else{
        return callback(body.Error);
      }
    });
  }

  sortBy(field:string){
    if(this.currentSort.Field && this.currentSort.Field==field){
      this.currentSort.ASC = !this.currentSort.ASC;
    }
    else{
      this.currentSort = {Field: field, ASC:true};
    }
    let mult:number = (this.currentSort.ASC ? 1 : -1);
    this.files.sort(function(a:File, b:File){
      if(a.IsDirectory === b.IsDirectory){
        if(a[field] < b[field]){
          return -1 * mult;
        }
        else if(a[field] > b[field]){
          return 1 * mult;
        }
        else{
          return 0 * mult;
        }
      }
      else{
        if(b.IsDirectory){
          return 1;
        }
        else{
          return -1;
        }
      }
    });
  }

  diveIn(folder:Directory){
    if(!folder.IsDirectory){
      return;
    }
    var that = this;
    this.breadcrumbs.push(folder);
    this.getFiles(folder.ID, function(err, data){
      if(err){
        console.log(err);
      }
      else{
        that.files=data.map(mapFiles);
      }
    });
  }

  navigateTo(location:Directory){
    //swim upstream
    var pid;
    if(!location){
      this.breadcrumbs = [];
      pid = null;
    }
    else{
      let i = this.breadcrumbs.indexOf(location);
      if(i>-1){
        this.breadcrumbs = this.breadcrumbs.slice(0,i+1);
      }
      console.log(this.breadcrumbs);
      pid = location.ID;
    }
    var that = this;
    this.getFiles(pid, function(err, data){
      if(err){
        console.log(err);
      }
      else{
        that.files=data.map(mapFiles);
      }
    });
  }

  downloadFile(file:File){
    //fetch file by ID
    //if file is shared, prompt for shared key
    var enccontents;
    var filecontents = this.encSvc.decrypt(enccontents, this.authSvc.key);
  }

  uploadFile(file:File){
    //send post to get fileid
    var contents;
    var encobj = this.encSvc.encrypt(contents, this.authSvc.key);
    //stream encobj.Data
    //stream encobj.Key
    //refresh browser
  }

  addDir(name:string){
    var that = this;
    this.http.post('/api/files/', {Name:name, Parent:this.currentView})
    .subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        that.adding=false;
        that.newFolderName = '';
        that.diveIn(new Directory(body.Directory));
      }
      else{
        console.log(body.Error);
      }
    });
  }
}
