import { provideRouter } from '@angular/router';

import {appRoutes} from './main.routes';

export const ROUTE_PROVIDERS = [
  provideRouter(appRoutes)
];
