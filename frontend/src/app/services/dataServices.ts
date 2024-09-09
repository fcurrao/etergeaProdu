
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import { Observable } from 'rxjs'; 
import { BehaviorSubject } from 'rxjs';
import { Data } from '../models/data';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private loadersSubject = new BehaviorSubject<number[]>([]);
  private failsSubject = new BehaviorSubject<number[]>([]);
  private datasSubject = new BehaviorSubject<Data[]>([]);
  private datasCheckedSubject = new BehaviorSubject<Data[]>([]);

  loaders$ = this.loadersSubject.asObservable();
  fails$ = this.failsSubject.asObservable();
  datas$ = this.datasSubject.asObservable();
  datasChecked$ = this.datasCheckedSubject.asObservable();

  constructor(private http: HttpClient) { }


  
  setLoaders(loaders: number[]) {
    this.loadersSubject.next(loaders);
  }

  setFails(fails: number[]) {
    this.failsSubject.next(fails);
  }

  setDatas(datas: Data[]) {
    this.datasSubject.next(datas);
  }

  setDatasChecked(datasChecked: Data[]) {
    this.datasCheckedSubject.next(datasChecked);
  }

  getAllEtergeas(): Observable<any> {
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}`
    });
    return this.http.get(environment.baseUrl + '/all', { headers });
  }
  getOneEtergea(number: any): Observable<any> {
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}` 
    });
    return this.http.get(environment.baseUrl + `/status/${number}`, { headers });
  }
  getGPSEtergea(number: any): Observable<any> {
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}` 
    });
    return this.http.get(environment.baseUrl + `/GPSstatus/${number}`, { headers });
  }
  getGPRSEtergea(number: any): Observable<any> {
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}` 
    });
    return this.http.get(environment.baseUrl + `/GPRSstatus/${number}`, { headers });
  }
  getPMEtergea(number: any): Observable<any> {
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}` 
    });
    return this.http.get(environment.baseUrl + `/PMstatus/${number}`, { headers });
  }
  postResetEtergeas(id: number, resetModem: boolean): Observable<any> { 
    const token = localStorage.getItem('token');  
    const headers = new HttpHeaders({ 
      'x-access-token': `${token}` 
    });
    const body = {
      reset_modem: resetModem
    }; 
    return this.http.post(environment.baseUrl +  `/reset/${id}`, body, { headers });  
  }
 


    

}
