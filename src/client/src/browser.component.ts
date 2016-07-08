import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

export class File{
  Name: string;
  Parent:Directory;
  LastModified: Date;
  IsDirectory: boolean = false;
  constructor(filename:string, lm?:Date){
    this.Name = filename;
    this.LastModified = lm || null;
  }
}

export class Directory extends File{
  IsDirectory:boolean = true;
  constructor(filename:string, lm?:Date){
    super(filename, lm);
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

  constructor(private authSvc:AuthService) {
    this.files = [
      new File('Sample.txt', new Date('05/07/2016')),
      new File('Maya.png', new Date('05/06/2016')),
      new Directory('My Stuff')
    ];
    this.sortBy('LastModified');
  }

  ngOnInit(){
    console.log(this.authSvc.isLoggedIn);
    this.authSvc.checkCreds();
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
      if(a.IsDirectory == b.IsDirectory){
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
    this.breadcrumbs.push(folder);
    //fetch files for that location
  }

  navigateTo(location:Directory){
    //swim upstream
    if(!location){
      this.breadcrumbs = [];
    }
    else{
      let i = this.breadcrumbs.indexOf(location);
      if(i>-1){
        this.breadcrumbs.splice(i,1);
      }
    }
    //fetch end location's files
  }
}
