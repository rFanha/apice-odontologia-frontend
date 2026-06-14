import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    manterConectado: [true],
  });

  protected readonly errorMessage = computed(() => {
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
  }

  protected entrar(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // A integracao real com /auth/login entra no item 154 do checklist.
    setTimeout(() => this.loading.set(false), 500);
  }
}
