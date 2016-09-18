import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import {EncryptionService} from './encryption.service';

@Injectable()
export class AuthService {
  public key:string;
  private user:{Email:string, ID:number};

  constructor(
    private http:Http,
    private encSvc:EncryptionService
  ){}

  checkCreds():Observable<boolean>{
    return this.http.get('/api/auth/')
    .map((res:Response) => res.json())
    .do( _ => {
        if(_.Success){
          this.user = _.User;
        }
      })
    .map(_ => _.Success)
    .do(x => console.log(x?'Resuming Session':'Unknown session'));
  }

  isLoggedIn():boolean{
    return !!this.user;
  }

  signup(email:string):Observable<{Success:boolean, Error?:any}>{
    return this.http.post('/api/auth/signup', {Email:email})
    .map((res:Response)=>res.json());
  }

  confirmEmail(confirm:string, encResponse:string, nonce:string, password:string):Observable<any>{
    return Observable.create((observer)=>{
      this.encSvc.setupKeys(encResponse, nonce, password, (err, result)=>{
        if(err){
          console.log(err);
          return {Success:false, Error:err};
        }
        else{
          this.key = result.Password.Key;
          console.log('This is your recovery key. Without it you cannot reset your password:', result.Reset.Key);
          this.http.post('/api/auth/confirm', {Confirm: confirm, Challenges:{Password:result.Password.Challenge, Reset:result.Reset.Challenge}})
          .map((res:Response)=>res.json())
          .catch(err=>{
            console.log(err);
            return Observable.of({Success: false, Error:err});
          }).subscribe();
        }
      });
    });
  }

  // @TODO: make models for API response
  validateUsername(email):Observable<any>{
    return this.http.post('/api/auth/login', {Email:email})
    .map((res:Response)=>res.json())
    .do(r=>console.log(r.Error||'valid username'));
  }

  getKey(password:string):Observable<string>{
    //generate key
    console.log('generating key!');
    return this.encSvc.generateKey(password, password)
    .do((key)=> this.key = key);
  }

  login(encdata:{Challenge:string, Nonce:string}, email:string, remember:boolean):Observable<any>{
    var plainResponse = this.encSvc.decrypt(encdata.Challenge, this.key);
    if(!plainResponse){
      return Observable.of({Success:false, Error:'Could not decrypt challenge'});
    }
    else{
      var encResponse = this.encSvc.encrypt(new Buffer(plainResponse.toString('base64'), 'base64'), encdata.Nonce);
      return this.http.post('/api/auth/login2', {Email:email, Response:encResponse})
      .map((res:Response)=>res.json())
      .do(_=> this.user = _.User||null);
    }
  }

  logout():boolean{
    this.user = null;
    //make call to api to invalidate session
    return true;
  }
}
