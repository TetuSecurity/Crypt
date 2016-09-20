import 'reflect-metadata';
import 'core-js';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';


import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './modules/app.module';

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);
