import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type PerfilUsuario = 'ADMIN' | 'DENTISTA';

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  dataCriacao: string;
  ultimoLogin: string | null;
}

export interface UsuarioPayload {
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('/api/usuarios');
  }

  criar(payload: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>('/api/usuarios', payload);
  }

  atualizar(id: number, payload: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`/api/usuarios/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`/api/usuarios/${id}`);
  }
}
