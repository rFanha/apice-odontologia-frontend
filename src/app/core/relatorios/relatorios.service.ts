import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import {
  ConsultaDashboard,
  DashboardResumo,
  DentistaResumo,
  EspecialidadeResumo,
  PacienteResumo,
} from '../dashboard/dashboard.service';
import { Usuario } from '../usuarios/usuarios.service';

export interface RelatorioFiltros {
  usuarioId?: string;
  pacienteId?: string;
  dentistaId?: string;
  especialidadeId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface RelatorioDados {
  resumo: DashboardResumo;
  consultas: ConsultaDashboard[];
  pacientes: PacienteResumo[];
  dentistas: DentistaResumo[];
  especialidades: EspecialidadeResumo[];
  usuarios: Usuario[];
}

@Injectable({
  providedIn: 'root',
})
export class RelatoriosService {
  private readonly http = inject(HttpClient);

  carregarDados(filtros: RelatorioFiltros): Observable<RelatorioDados> {
    const relatorioParams = this.montarParametrosRelatorio(filtros);
    const consultaParams = filtros.dentistaId ? new HttpParams().set('dentistaId', filtros.dentistaId) : undefined;

    return forkJoin({
      resumo: this.http.get<DashboardResumo>('/api/relatorios/dashboard', { params: relatorioParams }),
      consultas: this.http.get<ConsultaDashboard[]>('/api/consultas', { params: consultaParams }),
      pacientes: this.http.get<PacienteResumo[]>('/api/pacientes'),
      dentistas: this.http.get<DentistaResumo[]>('/api/dentistas'),
      especialidades: this.http.get<EspecialidadeResumo[]>('/api/especialidades'),
      usuarios: this.http.get<Usuario[]>('/api/usuarios'),
    });
  }

  private montarParametrosRelatorio(filtros: RelatorioFiltros): HttpParams {
    let params = new HttpParams();

    if (filtros.usuarioId) {
      params = params.set('usuarioId', filtros.usuarioId);
    }
    if (filtros.pacienteId) {
      params = params.set('pacienteId', filtros.pacienteId);
    }
    if (filtros.especialidadeId) {
      params = params.set('especialidadeId', filtros.especialidadeId);
    }
    if (filtros.dataInicio) {
      params = params.set('dataInicio', `${filtros.dataInicio}T00:00:00`);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', `${filtros.dataFim}T23:59:59`);
    }

    return params;
  }
}
