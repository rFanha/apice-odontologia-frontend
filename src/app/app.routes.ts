import { Routes } from '@angular/router';

import { perfilGuard } from './core/auth/perfil.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    // Shell envolve todas as paginas autenticadas com sidebar e topbar.
    path: '',
    loadComponent: () => import('./pages/shell/shell').then((m) => m.Shell),
    canActivate: [perfilGuard],
    children: [
      {
        path: 'dashboard',
        data: { perfis: ['ADMIN'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'usuarios',
        data: { perfis: ['ADMIN'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'consultas',
        data: { perfis: ['ADMIN', 'DENTISTA'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/consultas/consultas').then((m) => m.Consultas),
      },
      {
        path: 'pacientes',
        data: { perfis: ['ADMIN', 'DENTISTA'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/pacientes/pacientes').then((m) => m.Pacientes),
      },
      {
        path: 'dentistas',
        data: { perfis: ['ADMIN'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/dentistas/dentistas').then((m) => m.Dentistas),
      },
      {
        path: 'especialidades',
        data: { perfis: ['ADMIN'] },
        canActivate: [perfilGuard],
        loadComponent: () =>
          import('./pages/especialidades/especialidades').then((m) => m.Especialidades),
      },
      {
        path: 'relatorios',
        data: { perfis: ['ADMIN'] },
        canActivate: [perfilGuard],
        loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.Relatorios),
      },
    ],
  },
  {
    path: 'acesso-negado',
    loadComponent: () =>
      import('./pages/acesso-negado/acesso-negado').then((m) => m.AcessoNegado),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
