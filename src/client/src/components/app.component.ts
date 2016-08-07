import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EncryptionService } from '../services/encryption.service';
import { BrowserComponent } from './browser.component';
import { LoginComponent } from './login.component';
import { ConfirmComponent } from './confirm.component';

@Component({
    selector: 'crypt-app',
    templateUrl: '../templates/app.component.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, AuthService, EncryptionService]
})
export class AppComponent{
  Title: string =  'Crypt';
  constructor(
    private authSvc:AuthService,
    private encSvc: EncryptionService
  ) {

  }

  isLoggedIn():boolean{
    return this.authSvc.isLoggedIn();
  }

  logout(){
    this.authSvc.logout();
  }
}
