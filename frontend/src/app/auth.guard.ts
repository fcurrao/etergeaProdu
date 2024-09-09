import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  

  constructor(private router: Router) {}
  
  canActivate(): boolean {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      return true;
    } else { 
      // Redirigir al usuario a la página de login si no está autenticado
      this.router.navigate(['/login']);
      return false;
    }
  }
  
}
 
  
