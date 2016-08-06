import {RouterConfig} from '@angular/router';
import {BrowserComponent} from '../browser.component';
import {LoginComponent} from '../login.component';
import {ConfirmComponent} from '../confirm.component';

import {ConfirmResolver} from '../resolvers/confirm.resolver';

export const appRoutes: RouterConfig = [
  {path: '', component: BrowserComponent},
  {path: 'login',  component: LoginComponent},
  {path: 'confirm/:cid', component: ConfirmComponent, resolve:{ confData: ConfirmResolver}}
];
