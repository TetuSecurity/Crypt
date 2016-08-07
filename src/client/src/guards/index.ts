import {LoggedInGuard, NotLoggedInGuard} from './loggedin.guard';

export const GUARD_PROVIDERS = [
  LoggedInGuard,
  NotLoggedInGuard
];
