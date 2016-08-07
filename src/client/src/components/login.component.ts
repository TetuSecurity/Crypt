import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EncryptionService } from '../services/encryption.service';

@Component({
  selector: 'login',
  templateUrl: '../templates/login.component.html'
})
export class LoginComponent {
  email:string;
  password:string;
  remember:boolean;
  loggingIn:boolean=true;
  loading:boolean=false;
  authError:string;

  constructor(
    private authSvc:AuthService,
    private encSvc:EncryptionService,
    private router:Router
  ){ }

  signup():void{
    this.authSvc.signup(this.email).subscribe(res =>{
      if(res.Success){
        console.log('confirmation email sent');
      }
      else{
        this.authError = res.Error;
        console.log(res.Error);
      }
    });
  }

  logIn():void{
    console.log('Logging In');
    this.authSvc.validateUsername(this.email).subscribe((result)=>{
      var isValid = result.Success;
      console.log(result);
      if(isValid){
        this.loading= true;
        var encdata = {Challenge: result.Challenge, Nonce: result.Nonce};
        this.authSvc.getKey(this.password).subscribe(_=>{
          this.authSvc.login(encdata, this.email, this.remember)
          .subscribe(_=>{
            this.loading=false;
            this.router.navigate(['/']);
          }, (err)=> console.log(err));
        });
      }
      else{
        //throw error
      }
    });
  }



}
