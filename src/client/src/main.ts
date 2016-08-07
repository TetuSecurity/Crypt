import 'es6-shim';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';

import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { AppComponent } from './components/app.component';

import { ROUTE_PROVIDERS } from './routes';
import { SERVICE_PROVIDERS } from './services';
import { GUARD_PROVIDERS } from './guards';
import { ConfirmResolver } from './resolvers/confirm.resolver';

enableProdMode();

var PROVIDERS = []
  .concat(SERVICE_PROVIDERS)
  .concat(GUARD_PROVIDERS)
  .concat(ROUTE_PROVIDERS);

bootstrap(AppComponent, [
  PROVIDERS,
  ConfirmResolver,
  HTTP_PROVIDERS
]);
