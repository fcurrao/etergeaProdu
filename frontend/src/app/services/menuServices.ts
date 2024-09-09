import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MenuService { 
    private menuSubject = new BehaviorSubject<boolean>(false);
    menu$ = this.menuSubject.asObservable();


  constructor() { }

  getMenu(): boolean {
    return this.menuSubject.value;
  }
 
  setMenu(value: boolean): void {
    this.menuSubject.next(value);
  }
  
}