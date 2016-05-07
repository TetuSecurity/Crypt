import { Component, Pipe, PipeTransform } from '@angular/core';

export class File{
  Name: string;
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
export class BrowserComponent {
  files: File[];
  currentSort = {
    Field:undefined,
    ASC:undefined
  };

  constructor() {
    this.files = [
      new File('Sample.txt', new Date('05/07/2016')),
      new File('Maya.png', new Date('05/06/2016')),
      new Directory('My Stuff')
    ];
    this.sortBy('LastModified');
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
}