import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {EncryptionService} from '../services/encryption.service';

@Injectable()
export class ConfirmResolver implements Resolve<any> {
  constructor(
    private encSvc: EncryptionService,
    private http: Http
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    var nonce:string = this.encSvc.generateRandom(16);
    var cid:string = route.params['cid'];
    return this.http.get('/api/auth/confirm/'+cid+'/'+nonce)
    .map(res=>res.json())
    .map(_=>{
      _.Confirm=cid
      return _;
    })
    .map(_=>{
      _.Nonce=nonce;
      return _;
    });
  }
}
