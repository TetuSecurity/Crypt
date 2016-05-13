import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'login',
  templateUrl: 'templates/login.component.html'
})
export class LoginComponent {
  password:string;
  constructor(private authSvc:AuthService){ }

  logIn():void{
    console.log('Logging In');
    this.authSvc.login('username');
  }

}
