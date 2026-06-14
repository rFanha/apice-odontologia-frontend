import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import {
  ConsultaDashboard,
  DashboardDados,
  DashboardResumo,
  DashboardService,
  DentistaResumo,
  PacienteResumo,
  StatusConsulta,
} from '../../core/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly dados = signal<DashboardDados | null>(null);

  protected readonly usuario = this.authService.getSessao();

  protected readonly resumo = computed<DashboardResumo>(() => {
    return (
      this.dados()?.resumo ?? {
        totalConsultas: 0,
        consultasAgendadas: 0,
        consultasCanceladas: 0,
        consultasFinalizadas: 0,
        totalPacientes: 0,
        totalDentistas: 0,
        totalEspecialidades: 0,
      }
    );
  });

  protected readonly proximasConsultas = computed(() => {
    const dados = this.dados();

    if (!dados) {
      return [];
    }

    const pacientesPorId = new Map(dados.pacientes.map((paciente) => [paciente.id, paciente]));
    const dentistasPorId = new Map(dados.dentistas.map((dentista) => [dentista.id, dentista]));

    // Monta uma lista pronta para tela, mantendo os dados originais vindos da API.
    return dados.consultas
      .filter((consulta) => consulta.status !== 'CANCELADA')
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, 6)
      .map((consulta) => ({
        ...consulta,
        paciente: pacientesPorId.get(consulta.pacienteId),
        dentista: dentistasPorId.get(consulta.dentistaId),
      }));
  });

  ngOnInit(): void {
    this.carregarDashboard();
  }

  protected carregarDashboard(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.dashboardService.carregarDados().subscribe({
      next: (dados) => {
        this.dados.set(dados);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected nomeCurto(): string {
    const nome = this.usuario?.nome ?? 'Usuario';
    return nome.replace(/^(Dr\.|Dra\.)\s+/i, '').split(' ')[0];
  }

  protected percentual(valor: number, total: number): number {
    return total ? Math.round((valor / total) * 100) : 0;
  }

  protected statusLabel(status: StatusConsulta): string {
    const labels: Record<StatusConsulta, string> = {
      AGENDADA: 'Agendada',
      CANCELADA: 'Cancelada',
      FINALIZADA: 'Finalizada',
    };

    return labels[status];
  }

  protected formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data));
  }

  protected pacienteNome(paciente?: PacienteResumo): string {
    return paciente?.nome ?? 'Paciente nao encontrado';
  }

  protected dentistaNome(dentista?: DentistaResumo): string {
    return dentista?.nome ?? 'Dentista nao encontrado';
  }

  protected trackConsulta(_: number, consulta: ConsultaDashboard): number {
    return consulta.id;
  }

  private getMensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Nao foi possivel conectar ao backend em http://localhost:8080.';
      }

      if (error.status === 403) {
        return 'Seu usuario nao tem permissao para visualizar o dashboard.';
      }
    }

    return 'Nao foi possivel carregar os indicadores do dashboard.';
  }

}
