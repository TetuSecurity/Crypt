import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//components
import {BrowserComponent} from '../components/browser.component';
import {LoginComponent} from '../components/login.component';
import {ConfirmComponent} from '../components/confirm.component';
//resolvers
import {ConfirmResolver} from '../resolvers/confirm.resolver';
//guards
import {LoggedInGuard, NotLoggedInGuard} from '../guards/loggedin.guard';

const appRoutes: Routes = [
  {path: '', component: BrowserComponent, canActivate:[LoggedInGuard]},
  {path: 'login',  component: LoginComponent, canActivate:[NotLoggedInGuard]},
  {path: 'confirm/:cid', component: ConfirmComponent, canActivate:[NotLoggedInGuard], resolve:{ confData: ConfirmResolver}}
];

export const appRoutingProviders: any[] = [
  ConfirmResolver,
  LoggedInGuard,
  NotLoggedInGuard,
];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
