import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Usuario, UsuarioPayload, UsuariosService } from './usuarios.service';

const USUARIO_MOCK: Usuario = {
  id: 1,
  nome: 'Ana Admin',
  cpf: '12345678901',
  email: 'ana@apice.com.br',
  perfil: 'ADMIN',
  ativo: true,
  dataCriacao: '2025-01-01T00:00:00',
  ultimoLogin: null,
};

const PAYLOAD_MOCK: UsuarioPayload = {
  nome: 'Ana Admin',
  cpf: '12345678901',
  email: 'ana@apice.com.br',
  senha: 'senha123',
  perfil: 'ADMIN',
  ativo: true,
};

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UsuariosService],
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que nenhuma requisicao inesperada ficou pendente.
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar deve fazer GET /api/usuarios e retornar lista', () => {
    let resultado: Usuario[] | undefined;

    service.listar().subscribe((usuarios) => (resultado = usuarios));

    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.method).toBe('GET');

    req.flush([USUARIO_MOCK]);

    expect(resultado).toEqual([USUARIO_MOCK]);
  });

  it('criar deve fazer POST /api/usuarios com payload correto', () => {
    let resultado: Usuario | undefined;

    service.criar(PAYLOAD_MOCK).subscribe((usuario) => (resultado = usuario));

    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(USUARIO_MOCK);

    expect(resultado).toEqual(USUARIO_MOCK);
  });

  it('atualizar deve fazer PUT /api/usuarios/:id com payload correto', () => {
    const atualizado = { ...USUARIO_MOCK, nome: 'Ana Atualizada' };
    let resultado: Usuario | undefined;

    service.atualizar(1, PAYLOAD_MOCK).subscribe((usuario) => (resultado = usuario));

    const req = httpMock.expectOne('/api/usuarios/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(atualizado);

    expect(resultado).toEqual(atualizado);
  });

  it('excluir deve fazer DELETE /api/usuarios/:id', () => {
    let concluido = false;

    service.excluir(1).subscribe(() => (concluido = true));

    const req = httpMock.expectOne('/api/usuarios/1');
    expect(req.request.method).toBe('DELETE');

    req.flush(null);

    expect(concluido).toBeTrue();
  });
});
