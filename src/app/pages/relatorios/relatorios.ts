import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ConsultaDashboard, StatusConsulta } from '../../core/dashboard/dashboard.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';
import { RelatorioDados, RelatorioFiltros, RelatoriosService } from '../../core/relatorios/relatorios.service';

type ConsultaRelatorio = ConsultaDashboard & {
  pacienteNome: string;
  dentistaNome: string;
  usuarioNome: string;
};

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class Relatorios implements OnInit {
  private readonly relatoriosService = inject(RelatoriosService);

  protected readonly dados = signal<RelatorioDados | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly filtros = signal<RelatorioFiltros>({});

  protected readonly consultasFiltradas = computed(() => {
    const dados = this.dados();

    if (!dados) {
      return [];
    }

    const filtros = this.filtros();
    const pacientes = new Map(dados.pacientes.map((paciente) => [paciente.id, paciente.nome]));
    const dentistas = new Map(dados.dentistas.map((dentista) => [dentista.id, dentista.nome]));
    const usuarios = new Map(dados.usuarios.map((usuario) => [usuario.id, usuario.nome]));

    // Aplica na listagem os filtros que dependem dos registros completos de consulta.
    return dados.consultas
      .filter((consulta) => !filtros.pacienteId || consulta.pacienteId === Number(filtros.pacienteId))
      .filter((consulta) => !filtros.dentistaId || consulta.dentistaId === Number(filtros.dentistaId))
      .filter((consulta) => !filtros.usuarioId || consulta.usuarioId === Number(filtros.usuarioId))
      .filter((consulta) => !filtros.dataInicio || consulta.dataInicio.slice(0, 10) >= filtros.dataInicio)
      .filter((consulta) => !filtros.dataFim || consulta.dataInicio.slice(0, 10) <= filtros.dataFim)
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .map((consulta) => ({
        ...consulta,
        pacienteNome: pacientes.get(consulta.pacienteId) ?? 'Paciente não encontrado',
        dentistaNome: dentistas.get(consulta.dentistaId) ?? 'Dentista não encontrado',
        usuarioNome: usuarios.get(consulta.usuarioId) ?? 'Usuário não encontrado',
      }));
  });

  protected readonly resumoTabela = computed(() => {
    const consultas = this.consultasFiltradas();

    return {
      total: consultas.length,
      agendadas: consultas.filter((consulta) => consulta.status === 'AGENDADA').length,
      finalizadas: consultas.filter((consulta) => consulta.status === 'FINALIZADA').length,
      canceladas: consultas.filter((consulta) => consulta.status === 'CANCELADA').length,
    };
  });

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  protected carregarRelatorio(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.relatoriosService.carregarDados(this.filtros()).subscribe({
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

  protected atualizarFiltro(campo: keyof RelatorioFiltros, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;

    this.filtros.update((atual) => ({
      ...atual,
      [campo]: value || undefined,
    }));
  }

  protected limparFiltros(): void {
    this.filtros.set({});
    this.carregarRelatorio();
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

  protected get pacientes() {
    return this.dados()?.pacientes ?? [];
  }

  protected get dentistas() {
    return this.dados()?.dentistas ?? [];
  }

  protected get especialidades() {
    return this.dados()?.especialidades ?? [];
  }

  protected get usuarios() {
    return this.dados()?.usuarios ?? [];
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Não foi possível carregar a página de relatórios.');
  }
}
