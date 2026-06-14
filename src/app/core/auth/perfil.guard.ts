import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, LoginResponse } from './auth.service';

export const perfilGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const sessao = authService.getSessao();
  const perfisPermitidos = route.data['perfis'] as LoginResponse['perfil'][] | undefined;

  if (!sessao) {
    return router.createUrlTree(['/login']);
  }

  // Garante que telas administrativas nao sejam carregadas por perfis sem permissao.
  if (perfisPermitidos?.length && !perfisPermitidos.includes(sessao.perfil)) {
    return router.createUrlTree(['/acesso-negado']);
  }

  return true;
};
