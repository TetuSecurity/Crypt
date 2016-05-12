import { Component } from '@angular/core';
import * as crypto from 'crypto';

@Component({
  selector: 'login',
  templateUrl: 'templates/login.component.html'
})
export class LoginComponent {

  password:string;

  constructor() { }

  logIn():void{
    console.log('Logging In');
  }

  get passwordHash(){
    var hash = crypto.createHash('sha512');
    hash.update(this.password||'');
    return hash.digest('hex');
  }
}
