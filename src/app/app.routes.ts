import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'invitacion/:codigo', 
    component: InvitationComponent 
  },
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  },
  { 
    path: 'admin/mesas', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/mesas/mesas.component').then(m => m.MesasComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];