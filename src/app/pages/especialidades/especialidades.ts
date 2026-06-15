import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Especialidade, EspecialidadesService } from '../../core/especialidades/especialidades.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';

@Component({
  selector: 'app-especialidades',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.scss',
})
export class Especialidades implements OnInit {
  private readonly especialidadesService = inject(EspecialidadesService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly especialidades = signal<Especialidade[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  protected readonly busca = signal('');
  protected readonly formularioAberto = signal(false);
  protected readonly excluindo = signal<number | null>(null);
  protected readonly especialidadeForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
  });

  protected readonly especialidadesFiltradas = computed(() => {
    const busca = this.busca().trim().toLowerCase();
    const lista = busca
      ? this.especialidades().filter((especialidade) => especialidade.nome.toLowerCase().includes(busca))
      : this.especialidades();

    // Organiza a listagem por nome para facilitar a manutencao do cadastro.
    return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });

  ngOnInit(): void {
    this.carregarEspecialidades();
  }

  protected carregarEspecialidades(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.especialidadesService.listar().subscribe({
      next: (especialidades) => {
        this.especialidades.set(especialidades);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected abrirNovaEspecialidade(): void {
    this.limparMensagens();
    this.especialidadeForm.reset({ nome: '' });
    this.formularioAberto.set(true);
  }

  protected confirmarExclusao(especialidade: Especialidade): void {
    if (!window.confirm(`Excluir a especialidade "${especialidade.nome}"?\nEsta ação não pode ser desfeita.`)) return;
    this.limparMensagens();
    this.excluindo.set(especialidade.id);
    this.especialidadesService.excluir(especialidade.id).subscribe({
      next: () => {
        this.sucesso.set('Especialidade excluída com sucesso.');
        this.excluindo.set(null);
        this.carregarEspecialidades();
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.excluindo.set(null);
      },
    });
  }

  protected fecharFormulario(): void {
    if (this.salvando()) {
      return;
    }

    this.formularioAberto.set(false);
  }

  protected salvarEspecialidade(): void {
    this.limparMensagens();
    this.especialidadeForm.markAllAsTouched();

    if (this.especialidadeForm.invalid) {
      this.erro.set('Informe o nome da especialidade.');
      return;
    }

    this.salvando.set(true);

    this.especialidadesService
      .criar({
        nome: this.especialidadeForm.controls.nome.value.trim(),
      })
      .subscribe({
        next: () => {
          this.sucesso.set('Especialidade criada com sucesso.');
          this.salvando.set(false);
          this.formularioAberto.set(false);
          this.carregarEspecialidades();
        },
        error: (error: unknown) => {
          this.erro.set(this.getMensagemErro(error));
          this.salvando.set(false);
        },
      });
  }

  protected atualizarBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  protected campoInvalido(): boolean {
    const control = this.especialidadeForm.controls.nome;

    return control.invalid && (control.dirty || control.touched);
  }

  private limparMensagens(): void {
    this.erro.set('');
    this.sucesso.set('');
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Não foi possível concluir a operação de especialidades.');
  }
}
