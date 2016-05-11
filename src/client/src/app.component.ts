import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { Routes, Router, ROUTER_DIRECTIVES } from '@angular/router';
import { BrowserComponent } from './browser.component';
import { LoginComponent } from './login.component';

@Component({
    selector: 'crypt-app',
    templateUrl: 'templates/app.component.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS]
})
@Routes([
  {path: '/', component: BrowserComponent},
  {path: '/login',  component: LoginComponent}
])
export class AppComponent{
  Title: string =  'Crypt';
  constructor(private router: Router) {}
}
