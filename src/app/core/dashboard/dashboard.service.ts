import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

export type StatusConsulta = 'AGENDADA' | 'CANCELADA' | 'FINALIZADA';

export interface DashboardResumo {
  totalConsultas: number;
  consultasAgendadas: number;
  consultasCanceladas: number;
  consultasFinalizadas: number;
  totalPacientes: number;
  totalDentistas: number;
  totalEspecialidades: number;
}

export interface ConsultaDashboard {
  id: number;
  pacienteId: number;
  dentistaId: number;
  usuarioId: number;
  descricao: string;
  motivoCancelamento: string | null;
  dataInicio: string;
  dataFim: string;
  dataRegistro: string;
  status: StatusConsulta;
}

export interface PacienteResumo {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataCriacao: string;
}

export interface DentistaResumo {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  cro: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface DashboardDados {
  resumo: DashboardResumo;
  consultas: ConsultaDashboard[];
  pacientes: PacienteResumo[];
  dentistas: DentistaResumo[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  carregarDados(): Observable<DashboardDados> {
    // Agrupa as chamadas usadas pelos cards e pela lista de proximas consultas.
    return forkJoin({
      resumo: this.http.get<DashboardResumo>('/api/relatorios/dashboard'),
      consultas: this.http.get<ConsultaDashboard[]>('/api/consultas'),
      pacientes: this.http.get<PacienteResumo[]>('/api/pacientes'),
      dentistas: this.http.get<DentistaResumo[]>('/api/dentistas'),
    });
  }
}
