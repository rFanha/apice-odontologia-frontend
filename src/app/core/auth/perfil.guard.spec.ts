import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { perfilGuard } from './perfil.guard';

function criarRoute(perfis: string[]): ActivatedRouteSnapshot {
  const route = new ActivatedRouteSnapshot();
  (route as { data: unknown }).data = { perfis };
  return route;
}

const STATE_MOCK = {} as RouterStateSnapshot;

describe('perfilGuard — regras de negocio de acesso', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AuthService,
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    authService.logout();
  });

  it('sem sessao redireciona para /login', () => {
    authService.logout();

    const resultado = TestBed.runInInjectionContext(() =>
      perfilGuard(criarRoute(['ADMIN']), STATE_MOCK),
    );

    expect(resultado instanceof UrlTree).toBeTrue();
    expect((resultado as UrlTree).toString()).toBe('/login');
  });

  it('ADMIN pode acessar rota restrita a ADMIN', () => {
    spyOn(authService, 'getSessao').and.returnValue({
      id: 1, nome: 'Admin', email: 'a@a.com', perfil: 'ADMIN', ativo: true, token: 'tok',
    });

    const resultado = TestBed.runInInjectionContext(() =>
      perfilGuard(criarRoute(['ADMIN']), STATE_MOCK),
    );

    expect(resultado).toBeTrue();
  });

  it('DENTISTA nao pode acessar rota restrita a ADMIN — redireciona para /acesso-negado', () => {
    spyOn(authService, 'getSessao').and.returnValue({
      id: 2, nome: 'Dentista', email: 'b@b.com', perfil: 'DENTISTA', ativo: true, token: 'tok',
    });

    const resultado = TestBed.runInInjectionContext(() =>
      perfilGuard(criarRoute(['ADMIN']), STATE_MOCK),
    );

    expect(resultado instanceof UrlTree).toBeTrue();
    expect((resultado as UrlTree).toString()).toBe('/acesso-negado');
  });

  it('DENTISTA pode acessar rota compartilhada ADMIN+DENTISTA', () => {
    spyOn(authService, 'getSessao').and.returnValue({
      id: 2, nome: 'Dentista', email: 'b@b.com', perfil: 'DENTISTA', ativo: true, token: 'tok',
    });

    const resultado = TestBed.runInInjectionContext(() =>
      perfilGuard(criarRoute(['ADMIN', 'DENTISTA']), STATE_MOCK),
    );

    expect(resultado).toBeTrue();
  });

  it('rota sem restricao de perfil permite qualquer usuario autenticado', () => {
    spyOn(authService, 'getSessao').and.returnValue({
      id: 2, nome: 'Dentista', email: 'b@b.com', perfil: 'DENTISTA', ativo: true, token: 'tok',
    });

    const resultado = TestBed.runInInjectionContext(() =>
      perfilGuard(criarRoute([]), STATE_MOCK),
    );

    expect(resultado).toBeTrue();
  });
});
