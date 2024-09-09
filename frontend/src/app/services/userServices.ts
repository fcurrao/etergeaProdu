
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environments/environment'; 
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
    
    
 
  
  constructor(private http: HttpClient) { }

  postLogin(user:string,pass:string): Observable<any> {  
    const body = {
      username :user,
      password : pass
  }  
      return this.http.post(environment.baseUrl + `/login`, body);  
  }
  

//   getIdUser(): string | null { 
//     const user = localStorage.getItem('idUser');
//     return user;
//   } 

  getUser(): string | null { 
    const user = localStorage.getItem('user');
    return user;
  } 

  getToken(): string | null { 
    const token = localStorage.getItem('token');
    return token;
  } 
  

 
         
}