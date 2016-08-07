import {RouterConfig} from '@angular/router';
//components
import {BrowserComponent} from '../components/browser.component';
import {LoginComponent} from '../components/login.component';
import {ConfirmComponent} from '../components/confirm.component';
import {ConfirmResolver} from '../resolvers/confirm.resolver';

export const appRoutes: RouterConfig = [
  {path: '', component: BrowserComponent},
  {path: 'login',  component: LoginComponent},
  {path: 'confirm/:cid', component: ConfirmComponent, resolve:{ confData: ConfirmResolver}}
];
