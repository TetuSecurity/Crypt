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
    this.http.post('/api/auth/signup', {Email:email}).subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        that.router.navigateByUrl('/emailsent');
      }
      else{
        console.log(body.Error);
      }
    });
  }

  login(email:string, password:string, remember:boolean){
    let that = this;
    this.http.post('/api/auth/login', {Email:email}).subscribe(function(res:Response){
      let body = res.json();
      if(body.Success){
        var challenge = body.Challenge;
        var nonce = body.Nonce;
        let keyPromise = that.encSvc.generateKey(password, password);
        keyPromise.then(function(key){
          that.key = key;
          var response = that.encSvc.decrypt(challenge, key);
          if(!response){
            console.log('decryption error!');
            return;
          }
          else{
            var encrypted_response = that.encSvc.encrypt(response, nonce);
            that.http.post('/api/auth/login/2', {Email:email, Response: encrypted_response}).subscribe(function(res:Response){
              let body = res.json();
              if(body.Success){
                that.user = new User(body.User);
                return;
              }
              else{
                console.log(body.Error);
                return;
              }
            });
          }
        }, function(err){
          console.log(err);
          return;
        });
      }
      else{
        console.log(body.Error);
        return;
      }
    });
  }

  logout(){
    this.user = null;
    //make call to api to invalidate session
    this.router.navigateByUrl('/login');
  }
}
