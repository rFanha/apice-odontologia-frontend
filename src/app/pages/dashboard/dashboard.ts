import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';

import { AuthService } from '../../core/auth/auth.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';
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
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  @ViewChild('statusChart') private readonly statusChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('periodoChart') private readonly periodoChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('especialidadeChart') private readonly especialidadeChartRef?: ElementRef<HTMLCanvasElement>;

  private statusChart?: Chart;
  private periodoChart?: Chart;
  private especialidadeChart?: Chart;
  private viewReady = false;

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

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderizarGraficos();
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  protected carregarDashboard(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.dashboardService.carregarDados().subscribe({
      next: (dados) => {
        this.dados.set(dados);
        this.carregando.set(false);
        queueMicrotask(() => this.renderizarGraficos());
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected nomeCurto(): string {
    const nome = this.usuario?.nome ?? 'Usuário';
    return nome.replace(/^(Dr\.|Dra\.)\s+/i, '').split(' ')[0];
  }

  protected perfilLabel(): string {
    return this.usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Dentista';
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
    return paciente?.nome ?? 'Paciente não encontrado';
  }

  protected dentistaNome(dentista?: DentistaResumo): string {
    return dentista?.nome ?? 'Dentista não encontrado';
  }

  protected trackConsulta(_: number, consulta: ConsultaDashboard): number {
    return consulta.id;
  }

  private renderizarGraficos(): void {
    const dados = this.dados();

    if (!this.viewReady || !dados || this.carregando()) {
      return;
    }

    this.renderizarGraficoStatus(dados.resumo);
    this.renderizarGraficoPeriodo(dados.consultas);
    this.renderizarGraficoEspecialidade(dados.consultasPorEspecialidade);
  }

  private renderizarGraficoStatus(resumo: DashboardResumo): void {
    const canvas = this.statusChartRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.statusChart?.destroy();

    // Mostra rapidamente a proporcao dos status principais do dashboard.
    this.statusChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Agendadas', 'Finalizadas', 'Canceladas'],
        datasets: [
          {
            data: [resumo.consultasAgendadas, resumo.consultasFinalizadas, resumo.consultasCanceladas],
            backgroundColor: ['#808744', '#5f8f61', '#c2410c'],
            borderColor: '#fffdec',
            borderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              color: '#59604f',
              font: {
                weight: 700,
              },
            },
          },
        },
        cutout: '68%',
      },
    });
  }

  private renderizarGraficoPeriodo(consultas: ConsultaDashboard[]): void {
    const canvas = this.periodoChartRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.periodoChart?.destroy();

    const ultimosSeteDias = this.criarSerieUltimosSeteDias(consultas);

    // Agrupa consultas por dia para visualizar movimento recente da agenda.
    this.periodoChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ultimosSeteDias.map((item) => item.label),
        datasets: [
          {
            label: 'Consultas',
            data: ultimosSeteDias.map((item) => item.total),
            backgroundColor: '#8ec46c',
            borderRadius: 8,
            maxBarThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#6f7665',
              font: {
                weight: 700,
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#6f7665',
            },
            grid: {
              color: '#edf0df',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  private renderizarGraficoEspecialidade(
    consultasPorEspecialidade: DashboardDados['consultasPorEspecialidade'],
  ): void {
    const canvas = this.especialidadeChartRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.especialidadeChart?.destroy();

    const dadosOrdenados = [...consultasPorEspecialidade].sort(
      (a, b) => b.totalConsultas - a.totalConsultas,
    );

    // Usa o resumo filtrado do backend para representar consultas por especialidade.
    this.especialidadeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dadosOrdenados.map((item) => item.nome),
        datasets: [
          {
            label: 'Consultas',
            data: dadosOrdenados.map((item) => item.totalConsultas),
            backgroundColor: ['#808744', '#6ed6a4', '#8ec46c', '#a5d5aa', '#5f8f61'],
            borderRadius: 8,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#6f7665',
            },
            grid: {
              color: '#edf0df',
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#59604f',
              font: {
                weight: 700,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  private criarSerieUltimosSeteDias(consultas: ConsultaDashboard[]): Array<{ label: string; total: number }> {
    const hoje = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (6 - index));

      const chave = data.toISOString().slice(0, 10);
      const total = consultas.filter((consulta) => consulta.dataInicio.slice(0, 10) === chave).length;

      return {
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(data),
        total,
      };
    });
  }

  private destruirGraficos(): void {
    this.statusChart?.destroy();
    this.periodoChart?.destroy();
    this.especialidadeChart?.destroy();
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Não foi possível carregar os indicadores do dashboard.');
  }

}
