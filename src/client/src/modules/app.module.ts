import {NgModule, Component} from '@angular/core';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {routing, appRoutingProviders} from '../routes/main.routes';
import {SERVICE_PROVIDERS} from '../services';
import {GUARD_PROVIDERS} from '../guards';
import {ConfirmResolver} from '../resolvers/confirm.resolver';
import {AppComponent} from '../components/app.component';
import {BrowserComponent} from '../components/browser.component';
import {ConfirmComponent} from '../components/confirm.component';
import {LoginComponent} from '../components/login.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    routing,
  ],
  declarations: [
    AppComponent,
    BrowserComponent,
    ConfirmComponent,
    LoginComponent,
  ],
  providers: [
    ...SERVICE_PROVIDERS,
    ...appRoutingProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule{}
