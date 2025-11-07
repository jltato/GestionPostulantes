import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { LogoutCallbackComponent } from './logout-callback/logout-callback.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'listado/:tipo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'gestion/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./gestion/gestion.component').then((g) => g.GestionComponent),
  },
  {
    path: 'identity-redirect',
    // NO usar authGuard aquí porque necesitamos verificar la sesión primero
    loadComponent: () =>
      import('./identity-redirect/identity-redirect.component').then((c) => c.IdentityRedirectComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full', // Ruta por defecto
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  { 
    path: 'auth-callback', 
    component: AuthCallbackComponent 
  },
  { 
    path: 'logout-callback', 
    component: LogoutCallbackComponent 
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
];
