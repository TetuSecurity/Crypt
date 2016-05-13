import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export class User{
    constructor(Email:string){}
}

@Injectable()
export class AuthService {
  user:User;

  constructor(private router:Router){}

  get isLoggedIn():boolean{
    return !!this.user;
  }

  checkCreds(){
    //call to server to validate cookie
    if(!this.user){
      this.router.navigateByUrl('/login');
    }
  }

  login(email:string){
    this.user = new User(email);
    this.router.navigateByUrl('/');
  }

  logout(){
    this.user = null;
    //remove cookie
    //make call to api to invalidate session
    this.router.navigateByUrl('/login');
  }

}
