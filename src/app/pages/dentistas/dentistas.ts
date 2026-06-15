import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Dentista, DentistaRequest, DentistasService } from '../../core/dentistas/dentistas.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';

@Component({
  selector: 'app-dentistas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dentistas.html',
  styleUrl: './dentistas.scss',
})
export class Dentistas implements OnInit {
  private readonly dentistasService = inject(DentistasService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly dentistas = signal<Dentista[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  protected readonly busca = signal('');
  protected readonly filtroStatus = signal<'todos' | 'ativos' | 'inativos'>('todos');
  protected readonly formularioAberto = signal(false);
  protected readonly dentistaEmEdicao = signal<Dentista | null>(null);
  protected readonly dentistaForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
    cpf: ['', [Validators.required, Validators.maxLength(14)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    cro: ['', [Validators.required, Validators.maxLength(30)]],
    ativo: [true, Validators.required],
  });

  protected readonly dentistasFiltrados = computed(() => {
    const busca = this.busca().trim().toLowerCase();
    const status = this.filtroStatus();

    const lista = this.dentistas().filter((dentista) => {
      const combinaBusca =
        !busca ||
        [dentista.nome, dentista.email, dentista.cpf, dentista.cro]
          .some((valor) => valor.toLowerCase().includes(busca));
      const combinaStatus =
        status === 'todos' ||
        (status === 'ativos' && dentista.ativo) ||
        (status === 'inativos' && !dentista.ativo);

      return combinaBusca && combinaStatus;
    });

    // Ordena por nome para facilitar a leitura em equipes maiores.
    return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });

  protected readonly resumo = computed(() => {
    const dentistas = this.dentistas();

    return {
      total: dentistas.length,
      ativos: dentistas.filter((dentista) => dentista.ativo).length,
      inativos: dentistas.filter((dentista) => !dentista.ativo).length,
    };
  });

  ngOnInit(): void {
    this.carregarDentistas();
  }

  protected carregarDentistas(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.dentistasService.listar().subscribe({
      next: (dentistas) => {
        this.dentistas.set(dentistas);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected abrirNovoDentista(): void {
    this.limparMensagens();
    this.dentistaEmEdicao.set(null);
    this.dentistaForm.reset({
      nome: '',
      cpf: '',
      email: '',
      cro: '',
      ativo: true,
    });
    this.formularioAberto.set(true);
  }

  protected abrirEdicao(dentista: Dentista): void {
    this.limparMensagens();
    this.dentistaEmEdicao.set(dentista);
    this.dentistaForm.reset({
      nome: dentista.nome,
      cpf: dentista.cpf,
      email: dentista.email,
      cro: dentista.cro,
      ativo: dentista.ativo,
    });
    this.formularioAberto.set(true);
  }

  protected fecharFormulario(): void {
    if (this.salvando()) {
      return;
    }

    this.formularioAberto.set(false);
    this.dentistaEmEdicao.set(null);
  }

  protected salvarDentista(): void {
    this.limparMensagens();
    this.dentistaForm.markAllAsTouched();

    if (this.dentistaForm.invalid) {
      this.erro.set('Preencha os campos obrigatorios antes de salvar.');
      return;
    }

    const dentistaAtual = this.dentistaEmEdicao();
    const payload = this.criarPayload();
    const request$ = dentistaAtual
      ? this.dentistasService.atualizar(dentistaAtual.id, payload)
      : this.dentistasService.criar(payload);

    this.salvando.set(true);

    request$.subscribe({
      next: () => {
        this.sucesso.set(dentistaAtual ? 'Dentista atualizado com sucesso.' : 'Dentista criado com sucesso.');
        this.salvando.set(false);
        this.formularioAberto.set(false);
        this.dentistaEmEdicao.set(null);
        this.carregarDentistas();
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.salvando.set(false);
      },
    });
  }

  protected alternarStatus(dentista: Dentista): void {
    this.limparMensagens();

    this.dentistasService
      .atualizar(dentista.id, {
        nome: dentista.nome,
        cpf: dentista.cpf,
        email: dentista.email,
        cro: dentista.cro,
        ativo: !dentista.ativo,
      })
      .subscribe({
        next: () => {
          this.sucesso.set(dentista.ativo ? 'Dentista desativado com sucesso.' : 'Dentista reativado com sucesso.');
          this.carregarDentistas();
        },
        error: (error: unknown) => this.erro.set(this.getMensagemErro(error)),
      });
  }

  protected campoInvalido(campo: keyof typeof this.dentistaForm.controls): boolean {
    const control = this.dentistaForm.controls[campo];

    return control.invalid && (control.dirty || control.touched);
  }

  protected atualizarBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  protected atualizarFiltroStatus(event: Event): void {
    this.filtroStatus.set((event.target as HTMLSelectElement).value as 'todos' | 'ativos' | 'inativos');
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

  protected tituloFormulario(): string {
    return this.dentistaEmEdicao() ? 'Editar dentista' : 'Novo dentista';
  }

  protected subtituloFormulario(): string {
    return this.dentistaEmEdicao()
      ? 'Atualize os dados do profissional.'
      : 'Cadastre um profissional na equipe.';
  }

  protected textoBotaoSalvar(): string {
    if (this.salvando()) {
      return 'Salvando...';
    }

    return this.dentistaEmEdicao() ? 'Salvar alteracoes' : 'Cadastrar dentista';
  }

  private criarPayload(): DentistaRequest {
    const form = this.dentistaForm.getRawValue();

    // Mantem o payload alinhado ao DTO do backend e sem espacos acidentais.
    return {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      cro: form.cro.trim(),
      ativo: form.ativo,
    };
  }

  private limparMensagens(): void {
    this.erro.set('');
    this.sucesso.set('');
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Nao foi possivel concluir a operacao de dentistas.');
  }
}
