import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Paciente, PacienteRequest, PacientesService } from '../../core/pacientes/pacientes.service';

@Component({
  selector: 'app-pacientes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class Pacientes implements OnInit {
  private readonly pacientesService = inject(PacientesService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly pacientes = signal<Paciente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  protected readonly busca = signal('');
  protected readonly formularioAberto = signal(false);
  protected readonly pacienteForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
    cpf: ['', [Validators.required, Validators.maxLength(14)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    telefone: ['', [Validators.maxLength(30)]],
  });

  protected readonly pacientesFiltrados = computed(() => {
    const busca = this.busca().trim().toLowerCase();

    const pacientes = busca
      ? this.pacientes().filter((paciente) =>
          [paciente.nome, paciente.email, paciente.cpf, paciente.telefone]
            .filter(Boolean)
            .some((valor) => valor.toLowerCase().includes(busca)),
        )
      : this.pacientes();

    // Mantem a listagem previsivel para consulta rapida no atendimento.
    return [...pacientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
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

  protected abrirNovoPaciente(): void {
    this.limparMensagens();
    this.pacienteForm.reset({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
    });
    this.formularioAberto.set(true);
  }

  protected fecharFormulario(): void {
    if (this.salvando()) {
      return;
    }

    this.formularioAberto.set(false);
  }

  protected salvarPaciente(): void {
    this.limparMensagens();
    this.pacienteForm.markAllAsTouched();

    if (this.pacienteForm.invalid) {
      this.erro.set('Preencha os campos obrigatorios antes de salvar.');
      return;
    }

    this.salvando.set(true);

    this.pacientesService.criar(this.criarPayload()).subscribe({
      next: () => {
        this.sucesso.set('Paciente criado com sucesso.');
        this.salvando.set(false);
        this.formularioAberto.set(false);
        this.carregarPacientes();
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.salvando.set(false);
      },
    });
  }

  protected campoInvalido(campo: keyof typeof this.pacienteForm.controls): boolean {
    const control = this.pacienteForm.controls[campo];

    return control.invalid && (control.dirty || control.touched);
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

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }
    }

    return 'Nao foi possivel concluir a operacao de pacientes.';
  }

  private criarPayload(): PacienteRequest {
    const form = this.pacienteForm.getRawValue();

    // Normaliza espacos antes de enviar para manter a listagem limpa.
    return {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
    };
  }

  private limparMensagens(): void {
    this.erro.set('');
    this.sucesso.set('');
  }
}
