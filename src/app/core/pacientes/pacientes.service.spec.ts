import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Paciente, PacienteRequest, PacientesService } from './pacientes.service';

const PACIENTE_MOCK: Paciente = {
  id: 1,
  nome: 'Carlos Souza',
  email: 'carlos@email.com',
  cpf: '98765432100',
  telefone: '11999990000',
  dataCriacao: '2025-03-01T10:00:00',
};

const PAYLOAD_MOCK: PacienteRequest = {
  nome: 'Carlos Souza',
  email: 'carlos@email.com',
  cpf: '98765432100',
  telefone: '11999990000',
};

describe('PacientesService', () => {
  let service: PacientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PacientesService],
    });

    service = TestBed.inject(PacientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que nenhuma requisicao inesperada ficou pendente.
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar deve fazer GET /api/pacientes e retornar lista', () => {
    let resultado: Paciente[] | undefined;

    service.listar().subscribe((pacientes) => (resultado = pacientes));

    const req = httpMock.expectOne('/api/pacientes');
    expect(req.request.method).toBe('GET');

    req.flush([PACIENTE_MOCK]);

    expect(resultado).toEqual([PACIENTE_MOCK]);
  });

  it('criar deve fazer POST /api/pacientes com payload correto', () => {
    let resultado: Paciente | undefined;

    service.criar(PAYLOAD_MOCK).subscribe((paciente) => (resultado = paciente));

    const req = httpMock.expectOne('/api/pacientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(PACIENTE_MOCK);

    expect(resultado).toEqual(PACIENTE_MOCK);
  });

  it('atualizar deve fazer PUT /api/pacientes/:id com payload correto', () => {
    const atualizado = { ...PACIENTE_MOCK, nome: 'Carlos Atualizado' };
    let resultado: Paciente | undefined;

    service.atualizar(1, PAYLOAD_MOCK).subscribe((paciente) => (resultado = paciente));

    const req = httpMock.expectOne('/api/pacientes/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(atualizado);

    expect(resultado).toEqual(atualizado);
  });
});
