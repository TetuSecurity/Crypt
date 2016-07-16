import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { EncryptionService } from './encryption.service';

export class User{
    constructor(Email:string){}
}

@Injectable()
export class AuthService {
  user:User;
  public key:string;

  constructor(
    private router:Router,
    private http:Http,
    private encSvc:EncryptionService){}

  get isLoggedIn():boolean{
    return !!this.user;
  }

  checkCreds(){
    let that = this;
    this.http.get('/api/auth/').subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        that.user = body.User;
      }
      else{
        console.log(body.Error);
        that.router.navigateByUrl('/login');
      }
    });
  }

  signup(email:string, password:string){
    let that = this;
    this.http.post('/api/auth/signup', {Email:email, Password:password}).subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        that.router.navigateByUrl('/');
      }
      else{
        console.log(body.Error);
      }
    });
  }

  login(email:string, password:string, remember:boolean){
    let that = this;
    this.http.post('/api/auth/login', {Email:email, Password:password, Remember:remember}).subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        that.user = new User(email);
        that.router.navigateByUrl('/');
      }
      else{
        console.log(body.Error);
      }
    });
    /*
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
    */
  }

  logout(){
    this.user = null;
    //make call to api to invalidate session
    this.router.navigateByUrl('/login');
  }
}
