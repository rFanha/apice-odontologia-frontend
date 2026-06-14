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

  protected readonly resumoStatus = computed(() => {
    const consultas = this.dados()?.consultas ?? [];

    return {
      total: consultas.length,
      agendadas: consultas.filter((consulta) => consulta.status === 'AGENDADA').length,
      finalizadas: consultas.filter((consulta) => consulta.status === 'FINALIZADA').length,
      canceladas: consultas.filter((consulta) => consulta.status === 'CANCELADA').length,
    };
  });

  protected readonly proximasConsultas = computed(() => {
    const dados = this.dados();

    if (!dados) {
      return [];
    }

    const pacientes = new Map(dados.pacientes.map((paciente) => [paciente.id, paciente.nome]));
    const dentistas = new Map(dados.dentistas.map((dentista) => [dentista.id, dentista.nome]));

    // A pagina inicial mostra um recorte da agenda; a listagem completa entra no item 127.
    return dados.consultas
      .filter((consulta) => consulta.status !== 'CANCELADA')
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, 5)
      .map((consulta) => ({
        ...consulta,
        pacienteNome: pacientes.get(consulta.pacienteId) ?? 'Paciente nao encontrado',
        dentistaNome: dentistas.get(consulta.dentistaId) ?? 'Dentista nao encontrado',
      }));
  });

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
