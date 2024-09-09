import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/services/menuServices';
import { Subscription } from 'rxjs';
import * as esTranslations from '../../../assets/es.json' 
import { ToastService } from 'src/app/services/toastServices';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit { 
  user : string | null = "";
  menu : boolean = false;
  private menuSubscription: Subscription  | undefined;
  public es: any = (esTranslations as any).default || esTranslations;

  constructor(
    private menuServices : MenuService, 
    private ToastService : ToastService, 
  ) { }

  ngOnInit() {
     this.user = localStorage.getItem('user');
     let userStay = localStorage.getItem('userStay');
    if(userStay==null && this.user !== null && this.user !== undefined){
      this.ToastService.show("Bienvenido  "+ this.user , { classname: 'toastInfo blue', delay: 5000 }); 
    }
    setTimeout(() => {
      
      if (userStay==null){
        localStorage.setItem('userStay',this.user!)
      }
    }, 300);
     
    this.menuSubscription = this.menuServices.menu$.subscribe(menu => {
      this.menu = menu; 
    });

  }

}
