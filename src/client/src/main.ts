import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './components/app.component';

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);
