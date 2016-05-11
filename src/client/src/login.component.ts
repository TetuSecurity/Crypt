import { Component } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: 'templates/login.component.html'
})
export class LoginComponent {
  constructor() { }

  logIn():void{
    console.log('Logging In');
  }
}
