import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Dentista, DentistaRequest, DentistasService } from './dentistas.service';

const DENTISTA_MOCK: Dentista = {
  id: 1,
  nome: 'Dr. Lucas Lima',
  cpf: '11122233344',
  email: 'lucas@apice.com.br',
  cro: 'CRO-SP 12345',
  especialidadeId: 1,
  especialidadeIds: [1],
  ativo: true,
  dataCriacao: '2025-02-01T08:00:00',
};

const PAYLOAD_MOCK: DentistaRequest = {
  nome: 'Dr. Lucas Lima',
  cpf: '11122233344',
  email: 'lucas@apice.com.br',
  cro: 'CRO-SP 12345',
  especialidadeId: 1,
  especialidadeIds: [1],
  ativo: true,
};

describe('DentistasService', () => {
  let service: DentistasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DentistasService],
    });

    service = TestBed.inject(DentistasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar deve fazer GET /api/dentistas e retornar lista', () => {
    let resultado: Dentista[] | undefined;

    service.listar().subscribe((dentistas) => (resultado = dentistas));

    const req = httpMock.expectOne('/api/dentistas');
    expect(req.request.method).toBe('GET');

    req.flush([DENTISTA_MOCK]);

    expect(resultado).toEqual([DENTISTA_MOCK]);
  });

  it('criar deve fazer POST /api/dentistas com payload correto', () => {
    let resultado: Dentista | undefined;

    service.criar(PAYLOAD_MOCK).subscribe((dentista) => (resultado = dentista));

    const req = httpMock.expectOne('/api/dentistas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(DENTISTA_MOCK);

    expect(resultado).toEqual(DENTISTA_MOCK);
  });

  it('atualizar deve fazer PUT /api/dentistas/:id com payload correto', () => {
    const atualizado = { ...DENTISTA_MOCK, nome: 'Dr. Lucas Atualizado' };
    let resultado: Dentista | undefined;

    service.atualizar(1, PAYLOAD_MOCK).subscribe((dentista) => (resultado = dentista));

    const req = httpMock.expectOne('/api/dentistas/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(atualizado);

    expect(resultado).toEqual(atualizado);
  });
});
