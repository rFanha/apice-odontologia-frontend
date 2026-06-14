import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { Paciente, PacientesService } from '../../core/pacientes/pacientes.service';

@Component({
  selector: 'app-pacientes',
  imports: [CommonModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class Pacientes implements OnInit {
  private readonly pacientesService = inject(PacientesService);

  protected readonly pacientes = signal<Paciente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly busca = signal('');

  protected readonly pacientesFiltrados = computed(() => {
    const busca = this.busca().trim().toLowerCase();

    if (!busca) {
      return this.pacientes();
    }

    return this.pacientes().filter((paciente) =>
      [paciente.nome, paciente.email, paciente.cpf, paciente.telefone]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(busca)),
    );
  });

  protected readonly resumo = computed(() => {
    const pacientes = this.pacientes();
    const comEmail = pacientes.filter((paciente) => !!paciente.email).length;
    const comTelefone = pacientes.filter((paciente) => !!paciente.telefone).length;

    return {
      total: pacientes.length,
      comEmail,
      comTelefone,
    };
  });

  ngOnInit(): void {
    this.carregarPacientes();
  }

  protected carregarPacientes(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.pacientesService.listar().subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected atualizarBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  protected formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data));
  }

  protected iniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase();
  }

  private getMensagemErro(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Nao foi possivel conectar ao backend em http://localhost:8080.';
      }

      if (error.status === 403) {
        return 'Seu usuario nao tem permissao para visualizar pacientes.';
      }
    }

    return 'Nao foi possivel carregar a pagina de pacientes.';
  }
}
