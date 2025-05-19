import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: 'listado/:tipo',
    loadComponent: () =>
      import('./list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'gestion/:id',
    loadComponent: () =>
      import('./gestion/gestion.component').then((g) => g.GestionComponent),
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
];
