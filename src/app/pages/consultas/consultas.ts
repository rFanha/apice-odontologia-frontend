import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { ConsultasDados, ConsultasService } from '../../core/consultas/consultas.service';
import { ConsultaDashboard, StatusConsulta } from '../../core/dashboard/dashboard.service';

@Component({
  selector: 'app-consultas',
  imports: [CommonModule],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class Consultas implements OnInit {
  private readonly consultasService = inject(ConsultasService);
  private readonly authService = inject(AuthService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly dados = signal<ConsultasDados | null>(null);
  protected readonly usuario = this.authService.getSessao();
  protected readonly filtroPaciente = signal('');
  protected readonly filtroDentista = signal('');
  protected readonly filtroStatus = signal<'todos' | StatusConsulta>('todos');
  protected readonly filtroData = signal('');

  protected readonly resumoStatus = computed(() => {
    const consultas = this.dados()?.consultas ?? [];

    return {
      total: consultas.length,
      agendadas: consultas.filter((consulta) => consulta.status === 'AGENDADA').length,
      finalizadas: consultas.filter((consulta) => consulta.status === 'FINALIZADA').length,
      canceladas: consultas.filter((consulta) => consulta.status === 'CANCELADA').length,
    };
  });

  protected readonly consultasListadas = computed(() => {
    const dados = this.dados();

    if (!dados) {
      return [];
    }

    const pacientes = new Map(dados.pacientes.map((paciente) => [paciente.id, paciente.nome]));
    const dentistas = new Map(dados.dentistas.map((dentista) => [dentista.id, dentista.nome]));
    const pacienteId = this.filtroPaciente();
    const dentistaId = this.filtroDentista();
    const status = this.filtroStatus();
    const data = this.filtroData();

    // Enriquecemos os registros com nomes para evitar logica repetida no template.
    return dados.consultas
      .filter((consulta) => !pacienteId || consulta.pacienteId === Number(pacienteId))
      .filter((consulta) => !dentistaId || consulta.dentistaId === Number(dentistaId))
      .filter((consulta) => status === 'todos' || consulta.status === status)
      .filter((consulta) => !data || consulta.dataInicio.slice(0, 10) === data)
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .map((consulta) => ({
        ...consulta,
        pacienteNome: pacientes.get(consulta.pacienteId) ?? 'Paciente nao encontrado',
        dentistaNome: dentistas.get(consulta.dentistaId) ?? 'Dentista nao encontrado',
      }));
  });

  protected readonly pacientes = computed(() => this.dados()?.pacientes ?? []);
  protected readonly dentistas = computed(() => this.dados()?.dentistas ?? []);

  ngOnInit(): void {
    this.carregarConsultas();
  }

  protected carregarConsultas(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.consultasService.carregarDados().subscribe({
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

  protected perfilLabel(): string {
    return this.usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Dentista';
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

  protected trackConsulta(_: number, consulta: ConsultaDashboard): number {
    return consulta.id;
  }

  protected atualizarFiltroPaciente(event: Event): void {
    this.filtroPaciente.set((event.target as HTMLSelectElement).value);
  }

  protected atualizarFiltroDentista(event: Event): void {
    this.filtroDentista.set((event.target as HTMLSelectElement).value);
  }

  protected atualizarFiltroStatus(event: Event): void {
    this.filtroStatus.set((event.target as HTMLSelectElement).value as 'todos' | StatusConsulta);
  }

  protected atualizarFiltroData(event: Event): void {
    this.filtroData.set((event.target as HTMLInputElement).value);
  }

  protected limparFiltros(): void {
    this.filtroPaciente.set('');
    this.filtroDentista.set('');
    this.filtroStatus.set('todos');
    this.filtroData.set('');
  }

  private getMensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Nao foi possivel conectar ao backend em http://localhost:8080.';
      }

      if (error.status === 403) {
        return 'Seu usuario nao tem permissao para visualizar consultas.';
      }
    }

    return 'Nao foi possivel carregar a pagina de consultas.';
  }

}
