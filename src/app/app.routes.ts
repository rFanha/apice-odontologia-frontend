import { Routes } from '@angular/router';

import { perfilGuard } from './core/auth/perfil.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN'],
    },
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'usuarios',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN'],
    },
    loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios),
  },
  {
    path: 'acesso-negado',
    loadComponent: () =>
      import('./pages/acesso-negado/acesso-negado').then((m) => m.AcessoNegado),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
