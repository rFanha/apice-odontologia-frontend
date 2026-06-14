import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import {
  ConsultaDashboard,
  DentistaResumo,
  PacienteResumo,
  StatusConsulta,
} from '../dashboard/dashboard.service';

export interface ConsultasDados {
  consultas: ConsultaDashboard[];
  pacientes: PacienteResumo[];
  dentistas: DentistaResumo[];
}

export interface ConsultaRequest {
  pacienteId: number;
  dentistaId: number;
  descricao: string;
  motivoCancelamento: string | null;
  dataInicio: string;
  dataFim: string;
  status: StatusConsulta;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultasService {
  private readonly http = inject(HttpClient);

  carregarDados(): Observable<ConsultasDados> {
    // Carrega os relacionamentos necessarios para exibir nomes na pagina de consultas.
    return forkJoin({
      consultas: this.http.get<ConsultaDashboard[]>('/api/consultas'),
      pacientes: this.http.get<PacienteResumo[]>('/api/pacientes'),
      dentistas: this.http.get<DentistaResumo[]>('/api/dentistas'),
    });
  }

  criarConsulta(dados: ConsultaRequest): Observable<ConsultaDashboard> {
    return this.http.post<ConsultaDashboard>('/api/consultas', dados);
  }

  atualizarConsulta(id: number, dados: ConsultaRequest): Observable<ConsultaDashboard> {
    return this.http.put<ConsultaDashboard>(`/api/consultas/${id}`, dados);
  }
}
