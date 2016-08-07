import 'es6-shim';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';

import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { provideRouter, RouterConfig } from '@angular/router';
import { AppComponent } from './components/app.component';
import { appRoutes } from './routes/main.routes';
import { ConfirmResolver } from './resolvers/confirm.resolver';
import { EncryptionService } from './services/encryption.service';
import { AuthService } from './services/auth.service';
import { LoggedInGuard, NotLoggedInGuard } from './guards/loggedin.guard';

enableProdMode();

bootstrap(AppComponent, [
  LoggedInGuard,
  NotLoggedInGuard,
  ConfirmResolver,
  EncryptionService,
  AuthService,
  provideRouter(appRoutes),
  HTTP_PROVIDERS
]);
