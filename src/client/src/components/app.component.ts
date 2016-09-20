import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {EncryptionService} from '../services/encryption.service';

@Component({
    selector: 'crypt-app',
    templateUrl: '../templates/app.component.html'
})
export class AppComponent{
  Title: string =  'Crypt';
  constructor(
    private authSvc:AuthService,
    private encSvc: EncryptionService
  ) {}

  isLoggedIn():boolean{
    return this.authSvc.isLoggedIn();
  }

  logout(){
    this.authSvc.logout();
  }
}
