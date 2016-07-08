import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptionService } from './encryption.service';

export class User{
    constructor(Email:string){}
}

@Injectable()
export class AuthService {
  user:User;
  public key:string;

  constructor(private router:Router, private encSvc:EncryptionService){}

  get isLoggedIn():boolean{
    return !!this.user;
  }

  checkCreds(){
    //call to server to validate cookie
    if(!this.user){
      this.router.navigateByUrl('/login');
    }
  }

  login(email:string, password:string){
    //hash password before sending it off to server
    let passwordHash = this.encSvc.hash(password);
    //if login is a success....
    var salt = 'NaClisTableSalt'; //set salt from userdata
    this.user = new User(email);
    let that = this;
    let keyPromise = this.encSvc.generateKey(password, salt);
    console.log('got a promise!')
    this.router.navigateByUrl('/');
    keyPromise.then(function(key){
      console.log('key generated!');
      that.key = key;
      console.log(that.key);
    }, function(err){
      console.log(err);
      //notify of error and force re-login
    });
  }

  logout(){
    this.user = null;
    //remove cookie
    //make call to api to invalidate session
    this.router.navigateByUrl('/login');
  }
}
