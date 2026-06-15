import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Especialidade {
  id: number;
  nome: string;
}

export interface EspecialidadeRequest {
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class EspecialidadesService {
  private readonly http = inject(HttpClient);

  listar(nome?: string): Observable<Especialidade[]> {
    const params = nome ? { nome } : undefined;

    return this.http.get<Especialidade[]>('/api/especialidades', { params });
  }

  criar(dados: EspecialidadeRequest): Observable<Especialidade> {
    return this.http.post<Especialidade>('/api/especialidades', dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`/api/especialidades/${id}`);
  }
}
