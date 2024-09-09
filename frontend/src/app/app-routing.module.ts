import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilterComponent } from './filter/filter.component'; 
import { HomeComponent } from './home/home.component';
import { StatesComponent } from './states/states.component'; 
import { ManagementComponent } from './management/management.component'; 
import { MapsComponent } from './maps/maps.component'; 
import { MapsContainerComponent } from './mapsContainer/mapsContainer.component'; 
import { UserComponent } from './user/user.component'; 
import { LoginComponent } from './login/login.component'; 
import { AuthGuard } from './auth.guard';  
import { NotfoundComponent } from './components/notfound/notfound.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: FilterComponent, canActivate: [AuthGuard] }, 
  { path: 'maps', component: MapsContainerComponent, canActivate: [AuthGuard] },
  // { path: 'user', component: UserComponent, canActivate: [AuthGuard] }
  // { path: 'management', component: ManagementComponent, canActivate: [AuthGuard] },
  // { path: 'states', component: StatesComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotfoundComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
