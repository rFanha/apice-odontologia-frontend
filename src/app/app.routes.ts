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
    path: 'consultas',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN', 'DENTISTA'],
    },
    loadComponent: () => import('./pages/consultas/consultas').then((m) => m.Consultas),
  },
  {
    path: 'pacientes',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN', 'DENTISTA'],
    },
    loadComponent: () => import('./pages/pacientes/pacientes').then((m) => m.Pacientes),
  },
  {
    path: 'dentistas',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN'],
    },
    loadComponent: () => import('./pages/dentistas/dentistas').then((m) => m.Dentistas),
  },
  {
    path: 'especialidades',
    canActivate: [perfilGuard],
    data: {
      perfis: ['ADMIN'],
    },
    loadComponent: () =>
      import('./pages/especialidades/especialidades').then((m) => m.Especialidades),
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
