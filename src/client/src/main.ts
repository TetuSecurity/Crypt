import 'es6-shim';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';

import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { provideRouter, RouterConfig } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './routes/main.routes';
import { ConfirmResolver } from './resolvers/confirm.resolver';
import { EncryptionService } from './services/encryption.service';

enableProdMode();

bootstrap(AppComponent, [
  ConfirmResolver,
  EncryptionService,
  provideRouter(appRoutes),
  HTTP_PROVIDERS
]);
