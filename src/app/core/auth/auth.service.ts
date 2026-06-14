import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'DENTISTA';
  ativo: boolean;
  token: string;
}

const AUTH_STORAGE_KEY = 'apice.auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(dados: LoginRequest, manterConectado: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', dados).pipe(
      tap((response) => {
        const storage = manterConectado ? localStorage : sessionStorage;
        storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));

        const storageToClear = manterConectado ? sessionStorage : localStorage;
        storageToClear.removeItem(AUTH_STORAGE_KEY);
      }),
    );
  }

  getToken(): string | null {
    return this.getSessao()?.token ?? null;
  }

  getSessao(): LoginResponse | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
