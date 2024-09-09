import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/services/menuServices';
import * as esTranslations from '../../../assets/es.json' 
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  user : string | null = "";
  submenu : boolean = false;
  public es: any = (esTranslations as any).default || esTranslations; 

  constructor(
    private menuServices: MenuService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.submenu = false 
    this.user = localStorage.getItem('user'); 
  }
 

  logout() { 
    localStorage.removeItem('user');
    localStorage.removeItem('token'); 
    localStorage.removeItem('userStay'); 
    localStorage.removeItem('datas'); 
    this.router.navigate(['/login']); 
      location.reload(); 
  }

  openMenu() {
    const currentMenuState = this.menuServices.getMenu();
    this.menuServices.setMenu(!currentMenuState);
  }

  focusOut() {
   this.submenu = false
  }

  optionsUser() {
   this.submenu = !this.submenu
  }

}
