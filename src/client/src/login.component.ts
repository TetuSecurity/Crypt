import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { EncryptionService } from './services/encryption.service';

@Component({
  selector: 'login',
  templateUrl: 'templates/login.component.html'
})
export class LoginComponent {
  email:string;
  password:string;
  remember:boolean;
  loggingIn:boolean=true;
  loading:boolean=false;

  constructor(
    private authSvc:AuthService,
    private encSvc:EncryptionService
  ){ }

  signup():void{
    this.authSvc.signup(this.email, this.password);
  }

  logIn():void{
    console.log('Logging In');
    this.loading= true;
    var that = this;
    setTimeout(function(){
      that.authSvc.login(that.email, that.password, that.remember);
    }, 250);
  }



}
