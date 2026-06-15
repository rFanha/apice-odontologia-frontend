import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  CancelamentoConsultaRequest,
  ConsultaRequest,
  ConsultasService,
} from './consultas.service';
import { ConsultaDashboard } from '../dashboard/dashboard.service';

const CONSULTA_MOCK: ConsultaDashboard = {
  id: 1,
  pacienteId: 10,
  dentistaId: 20,
  descricao: 'Consulta de rotina',
  motivoCancelamento: null,
  dataInicio: '2025-06-01T09:00:00',
  dataFim: '2025-06-01T10:00:00',
  dataRegistro: '2025-05-20T08:00:00',
  status: 'AGENDADA',
  usuarioId: 1,
};

const PAYLOAD_MOCK: ConsultaRequest = {
  pacienteId: 10,
  dentistaId: 20,
  descricao: 'Consulta de rotina',
  motivoCancelamento: null,
  dataInicio: '2025-06-01T09:00:00',
  dataFim: '2025-06-01T10:00:00',
  status: 'AGENDADA',
};

describe('ConsultasService', () => {
  let service: ConsultasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ConsultasService],
    });

    service = TestBed.inject(ConsultasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('carregarDados deve fazer GET nas 3 APIs e combinar resultados', () => {
    let concluido = false;

    service.carregarDados().subscribe(() => (concluido = true));

    httpMock.expectOne('/api/consultas').flush([CONSULTA_MOCK]);
    httpMock.expectOne('/api/pacientes').flush([]);
    httpMock.expectOne('/api/dentistas').flush([]);

    expect(concluido).toBeTrue();
  });

  it('criarConsulta deve fazer POST /api/consultas com payload correto', () => {
    let resultado: ConsultaDashboard | undefined;

    service.criarConsulta(PAYLOAD_MOCK).subscribe((c) => (resultado = c));

    const req = httpMock.expectOne('/api/consultas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(CONSULTA_MOCK);

    expect(resultado).toEqual(CONSULTA_MOCK);
  });

  it('atualizarConsulta deve fazer PUT /api/consultas/:id com payload correto', () => {
    const atualizada = { ...CONSULTA_MOCK, descricao: 'Revisao geral' };
    let resultado: ConsultaDashboard | undefined;

    service.atualizarConsulta(1, PAYLOAD_MOCK).subscribe((c) => (resultado = c));

    const req = httpMock.expectOne('/api/consultas/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(PAYLOAD_MOCK);

    req.flush(atualizada);

    expect(resultado).toEqual(atualizada);
  });

  it('cancelarConsulta deve fazer PUT /api/consultas/:id/cancelar com motivo', () => {
    // Valida regra: cancelamento exige motivo enviado ao endpoint correto.
    const cancelamento: CancelamentoConsultaRequest = {
      motivoCancelamento: 'Paciente solicitou reagendamento.',
    };
    const cancelada = { ...CONSULTA_MOCK, status: 'CANCELADA' as const, motivoCancelamento: cancelamento.motivoCancelamento };
    let resultado: ConsultaDashboard | undefined;

    service.cancelarConsulta(1, cancelamento).subscribe((c) => (resultado = c));

    const req = httpMock.expectOne('/api/consultas/1/cancelar');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cancelamento);

    req.flush(cancelada);

    expect(resultado?.status).toBe('CANCELADA');
    expect(resultado?.motivoCancelamento).toBe(cancelamento.motivoCancelamento);
  });
});
