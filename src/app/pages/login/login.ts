import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly apiError = signal('');
  protected readonly successMessage = signal('');

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    manterConectado: [true],
  });

  protected readonly errorMessage = computed(() => {
    if (this.apiError()) {
      return this.apiError();
    }

    if (!this.submitted() || this.loginForm.valid) {
      return '';
    }

    return 'Preencha e-mail e senha para continuar.';
  });
  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected preencherDemo(tipo: 'admin' | 'dentista'): void {
    this.loginForm.patchValue({
      email:
        tipo === 'admin'
          ? 'admin@apiceodontologia.com.br'
          : 'marina.lopes@apiceodontologia.com.br',
      senha: 'Apice@123',
      manterConectado: true,
    });
    this.submitted.set(false);
    this.apiError.set('');
    this.successMessage.set('');
  }

  protected entrar(): void {
    this.submitted.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, senha, manterConectado } = this.loginForm.getRawValue();

    this.authService.login({ email: email.trim(), senha }, manterConectado).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.successMessage.set(`Login realizado com sucesso. Bem-vindo(a), ${usuario.nome}.`);
        void this.router.navigateByUrl(usuario.perfil === 'ADMIN' ? '/dashboard' : '/acesso-negado');
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.apiError.set(this.getLoginErrorMessage(error));
      },
    });
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Nao foi possivel conectar ao backend em http://localhost:8080.';
      }

      if (error.status === 401) {
        return 'E-mail ou senha invalidos.';
      }
    }

    return 'Nao foi possivel realizar o login. Tente novamente.';
  }
}
