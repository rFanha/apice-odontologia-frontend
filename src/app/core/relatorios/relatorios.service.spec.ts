import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RelatorioDados, RelatorioFiltros, RelatoriosService } from './relatorios.service';
import { DashboardResumo } from '../dashboard/dashboard.service';

const RESUMO_VAZIO: DashboardResumo = {
  totalConsultas: 0,
  consultasAgendadas: 0,
  consultasCanceladas: 0,
  consultasFinalizadas: 0,
  totalPacientes: 0,
  totalDentistas: 0,
  totalEspecialidades: 0,
};

function flushTodas(httpMock: HttpTestingController): void {
  httpMock.expectOne((r) => r.url === '/api/relatorios/dashboard').flush(RESUMO_VAZIO);
  httpMock.expectOne((r) => r.url === '/api/consultas').flush([]);
  httpMock.expectOne('/api/pacientes').flush([]);
  httpMock.expectOne('/api/dentistas').flush([]);
  httpMock.expectOne('/api/especialidades').flush([]);
  httpMock.expectOne('/api/usuarios').flush([]);
}

describe('RelatoriosService', () => {
  let service: RelatoriosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), RelatoriosService],
    });

    service = TestBed.inject(RelatoriosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('carregarDados sem filtros deve fazer requests nas 6 APIs', () => {
    let resultado: RelatorioDados | undefined;

    service.carregarDados({}).subscribe((dados) => (resultado = dados));

    flushTodas(httpMock);

    expect(resultado).toBeDefined();
  });

  it('carregarDados com filtro pacienteId deve enviar param na URL do relatorio', () => {
    const filtros: RelatorioFiltros = { pacienteId: '5' };

    service.carregarDados(filtros).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/relatorios/dashboard');
    expect(req.request.params.get('pacienteId')).toBe('5');

    httpMock.expectOne((r) => r.url === '/api/consultas').flush([]);
    httpMock.expectOne('/api/pacientes').flush([]);
    httpMock.expectOne('/api/dentistas').flush([]);
    httpMock.expectOne('/api/especialidades').flush([]);
    httpMock.expectOne('/api/usuarios').flush([]);

    req.flush(RESUMO_VAZIO);
  });

  it('carregarDados com filtro dentistaId deve enviar param na URL de consultas', () => {
    const filtros: RelatorioFiltros = { dentistaId: '3' };

    service.carregarDados(filtros).subscribe();

    httpMock.expectOne((r) => r.url === '/api/relatorios/dashboard').flush(RESUMO_VAZIO);

    const reqConsultas = httpMock.expectOne((r) => r.url === '/api/consultas');
    expect(reqConsultas.request.params.get('dentistaId')).toBe('3');
    reqConsultas.flush([]);

    httpMock.expectOne('/api/pacientes').flush([]);
    httpMock.expectOne('/api/dentistas').flush([]);
    httpMock.expectOne('/api/especialidades').flush([]);
    httpMock.expectOne('/api/usuarios').flush([]);
  });
});
