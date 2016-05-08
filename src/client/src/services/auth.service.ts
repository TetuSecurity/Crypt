import { Injectable } from '@angular/core';

export class User{
    Email:string;
    
}

@Injectable()
export class AuthService {

  user:User;

}
