import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

export interface EspecialidadeResumo {
  id: number;
  nome: string;
}

export interface EspecialidadeIndicador {
  id: number;
  nome: string;
  totalConsultas: number;
}

export interface DashboardDados {
  resumo: DashboardResumo;
  consultas: ConsultaDashboard[];
  pacientes: PacienteResumo[];
  dentistas: DentistaResumo[];
  especialidades: EspecialidadeResumo[];
  consultasPorEspecialidade: EspecialidadeIndicador[];
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
      especialidades: this.http.get<EspecialidadeResumo[]>('/api/especialidades'),
    }).pipe(
      switchMap((dados) => {
        if (!dados.especialidades.length) {
          return of({
            ...dados,
            consultasPorEspecialidade: [],
          });
        }

        const consultasPorEspecialidade$ = dados.especialidades.map((especialidade) =>
          this.http
            .get<DashboardResumo>(`/api/relatorios/dashboard?especialidadeId=${especialidade.id}`)
            .pipe(
              map((resumo) => ({
                id: especialidade.id,
                nome: especialidade.nome,
                totalConsultas: resumo.totalConsultas,
              })),
            ),
        );

        return forkJoin(consultasPorEspecialidade$).pipe(
          map((consultasPorEspecialidade) => ({
            ...dados,
            consultasPorEspecialidade,
          })),
        );
      }),
    );
  }
}
