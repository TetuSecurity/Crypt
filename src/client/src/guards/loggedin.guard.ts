import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
    return this.authService.checkCreds()
    .do(loggedIn=>{
      if(!loggedIn){
        this.router.navigate(['login']);
      }
    });
  }
}

@Injectable()
export class NotLoggedInGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
    return this.authService.checkCreds()
    .do(loggedIn=>{
      if(loggedIn){
        this.router.navigate(['/']);
      }
    });
  }
}
