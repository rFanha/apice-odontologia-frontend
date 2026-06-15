import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Especialidade, EspecialidadeRequest, EspecialidadesService } from './especialidades.service';

const ESPECIALIDADE_MOCK: Especialidade = {
  id: 1,
  nome: 'Ortodontia',
};

const PAYLOAD_MOCK: EspecialidadeRequest = {
  nome: 'Ortodontia',
};

describe('EspecialidadesService', () => {
  let service: EspecialidadesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EspecialidadesService],
    });

    service = TestBed.inject(EspecialidadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar sem filtro deve fazer GET /api/especialidades', () => {
    let resultado: Especialidade[] | undefined;

    service.listar().subscribe((esp) => (resultado = esp));

    const req = httpMock.expectOne('/api/especialidades');
    expect(req.request.method).toBe('GET');

    req.flush([ESPECIALIDADE_MOCK]);

    expect(resultado).toEqual([ESPECIALIDADE_MOCK]);
  });

  it('listar com filtro nome deve incluir param nome na URL', () => {
    service.listar('Orto').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/especialidades');
    expect(req.request.params.get('nome')).toBe('Orto');

    req.flush([ESPECIALIDADE_MOCK]);
  });

  it('criar deve fazer POST /api/especialidades com payload correto', () => {
    let resultado: Especialidade | undefined;

    service.criar(PAYLOAD_MOCK).subscribe((esp) => (resultado = esp));

    const req = httpMock.expectOne('/api/especialidades');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(ESPECIALIDADE_MOCK);

    expect(resultado).toEqual(ESPECIALIDADE_MOCK);
  });
});
