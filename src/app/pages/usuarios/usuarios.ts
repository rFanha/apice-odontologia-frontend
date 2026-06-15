import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  PerfilUsuario,
  Usuario,
  UsuarioPayload,
  UsuariosService,
} from '../../core/usuarios/usuarios.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  protected readonly busca = signal('');
  protected readonly filtroPerfil = signal<'todos' | PerfilUsuario>('todos');
  protected readonly usuarioEmEdicao = signal<Usuario | null>(null);
  protected readonly formularioAberto = signal(false);

  protected readonly usuarioForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
    cpf: ['', [Validators.required, Validators.maxLength(14)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    senha: [''],
    perfil: ['DENTISTA' as PerfilUsuario, [Validators.required]],
    ativo: [true, [Validators.required]],
  });

  protected readonly usuariosFiltrados = computed(() => {
    const busca = this.busca().trim().toLowerCase();
    const perfil = this.filtroPerfil();

    return this.usuarios().filter((usuario) => {
      const combinaBusca =
        !busca ||
        usuario.nome.toLowerCase().includes(busca) ||
        usuario.email.toLowerCase().includes(busca) ||
        usuario.cpf.includes(busca);

      const combinaPerfil = perfil === 'todos' || usuario.perfil === perfil;

      return combinaBusca && combinaPerfil;
    });
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  protected carregarUsuarios(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected abrirNovoUsuario(): void {
    this.usuarioEmEdicao.set(null);
    this.usuarioForm.reset({
      nome: '',
      cpf: '',
      email: '',
      senha: '',
      perfil: 'DENTISTA',
      ativo: true,
    });
    this.formularioAberto.set(true);
    this.limparMensagens();
  }

  protected abrirEdicao(usuario: Usuario): void {
    this.usuarioEmEdicao.set(usuario);
    this.usuarioForm.reset({
      nome: usuario.nome,
      cpf: usuario.cpf,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    this.formularioAberto.set(true);
    this.limparMensagens();
  }

  protected fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.usuarioEmEdicao.set(null);
  }

  protected salvarUsuario(): void {
    this.limparMensagens();

    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.erro.set('Preencha os campos obrigatórios antes de salvar.');
      return;
    }

    const usuarioAtual = this.usuarioEmEdicao();
    const payload = this.criarPayload(usuarioAtual);

    if (!usuarioAtual && !payload.senha) {
      this.erro.set('Senha é obrigatória para criar um usuário.');
      return;
    }

    this.salvando.set(true);

    const request$ = usuarioAtual
      ? this.usuariosService.atualizar(usuarioAtual.id, payload)
      : this.usuariosService.criar(payload);

    request$.subscribe({
      next: () => {
        this.sucesso.set(usuarioAtual ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.');
        this.salvando.set(false);
        this.fecharFormulario();
        this.carregarUsuarios();
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.salvando.set(false);
      },
    });
  }

  protected excluirUsuario(usuario: Usuario): void {
    const confirmou = window.confirm(`Deseja excluir o usuário ${usuario.nome}?`);

    if (!confirmou) {
      return;
    }

    // Remove no backend e recarrega a lista para refletir o estado real.
    this.usuariosService.excluir(usuario.id).subscribe({
      next: () => {
        this.sucesso.set('Usuário excluído com sucesso.');
        this.carregarUsuarios();
      },
      error: (error: unknown) => this.erro.set(this.getMensagemErro(error)),
    });
  }

  protected atualizarBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  protected atualizarFiltroPerfil(event: Event): void {
    this.filtroPerfil.set((event.target as HTMLSelectElement).value as 'todos' | PerfilUsuario);
  }

  protected formatarData(data: string | null): string {
    if (!data) {
      return 'Sem registro';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data));
  }

  private criarPayload(usuarioAtual: Usuario | null): UsuarioPayload {
    const form = this.usuarioForm.getRawValue();
    const senha = form.senha.trim();

    // Envia senha somente quando preenchida, preservando a senha atual na edicao.
    return {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      ...(senha ? { senha } : {}),
      perfil: form.perfil,
      ativo: form.ativo,
    };
  }

  protected campoInvalido(campo: keyof typeof this.usuarioForm.controls): boolean {
    const control = this.usuarioForm.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  private limparMensagens(): void {
    this.erro.set('');
    this.sucesso.set('');
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Não foi possível concluir a operação.');
  }
}
