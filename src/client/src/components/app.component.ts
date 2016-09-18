import {NgModule, Component} from '@angular/core';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {ROUTE_PROVIDERS} from '../routes';
import {SERVICE_PROVIDERS} from '../services';
import {GUARD_PROVIDERS} from '../guards';
import {ConfirmResolver} from '../resolvers/confirm.resolver';
import {AuthService} from '../services/auth.service';
import {EncryptionService} from '../services/encryption.service';
import {BrowserComponent} from './browser.component';
import {LoginComponent} from './login.component';
import {ConfirmComponent} from './confirm.component';

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

  isLoggedIn():boolean{return this.authSvc.isLoggedIn();}

  logout(){this.authSvc.logout();}
}

var PROVIDERS = [
  ConfirmResolver,
  ...SERVICE_PROVIDERS,
  ...GUARD_PROVIDERS,
];

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(ROUTE_PROVIDERS)
  ],
  declarations: [
    AppComponent,
    BrowserComponent,
    LoginComponent,
    ConfirmComponent,
  ],
  providers: PROVIDERS,
  bootstrap: [AppComponent]
})
export class AppModule{}
