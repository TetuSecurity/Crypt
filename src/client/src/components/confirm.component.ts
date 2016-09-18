import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {EncryptionService} from '../services/encryption.service';

@Component({
  selector: 'confirmation',
  templateUrl: 'templates/confirm.component.html'
})
export class ConfirmComponent {
  password:string;
  loading:boolean=false;
  authError:string;
  confData:{Success:boolean, Confirm:string, Nonce:string, Challenge:string, Error:any};

  constructor(
    private route:ActivatedRoute,
    private authSvc:AuthService,
    private encSvc:EncryptionService
  ){
    var rdata = this.route.snapshot.data['confData'];
    this.confData = rdata;
    console.log(this.confData);
    if(!this.confData || !this.confData.Success){
      console.log('could not fetch confirmation details');
    }
  }

  confirm():void{
    this.authSvc.confirmEmail(this.confData.Confirm, this.confData.Challenge, this.confData.Nonce, this.password)
    .subscribe(_=>{
      if(_.Success){
        console.log('email confirmed!');
        console.log(_.ResetKey);
      }
      else{
        console.log(_.Error);
      }
    });
  }

}
