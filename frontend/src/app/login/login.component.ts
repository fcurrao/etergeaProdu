import { Component, OnInit } from '@angular/core';
import * as esTranslations from '../../assets/es.json'
import { UserService } from '../services/userServices';
import { ToastService } from '../services/toastServices';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public es: any = (esTranslations as any).default || esTranslations; 


  constructor(
    private userServices: UserService,
    private ToastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    setTimeout(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userStay');
    }, 700);
  }

  login = async (event?: any) => {
    if (!event || event.key === 'Enter') {
      let usernameInput = document.getElementById('username')! as HTMLInputElement
      let passwordInput = document.getElementById('password')! as HTMLInputElement
      let username = usernameInput.value
      let password = passwordInput.value
      try {
        const resp = await this.userServices.postLogin(username, password).toPromise();
        console.log(resp) 
        if (resp.token) { 
            localStorage.setItem('user', username);
            localStorage.setItem('token', resp.token);
            this.router.navigate(['/home']);
            setTimeout(() => {
              location.reload();
            }, 10);
          }
        } 
      catch (error) {
        this.ToastService.show("Usuario y/o contraseña Incorrecta", { classname: 'toastInfo red', delay: 10000 }); 
        console.error('Error:', error); 
      } finally { 
      } 
    }
  }
}
