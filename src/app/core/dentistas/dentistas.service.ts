import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Dentista {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  cro: string;
  especialidadeId?: number | null;
  especialidadeIds?: number[];
  especialidade?: { id: number; nome: string } | null;
  especialidades?: Array<{ id: number; nome: string }>;
  ativo: boolean;
  dataCriacao: string;
}

export interface DentistaRequest {
  nome: string;
  cpf: string;
  email: string;
  cro: string;
  especialidadeId: number;
  especialidadeIds: number[];
  ativo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DentistasService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Dentista[]> {
    return this.http.get<Dentista[]>('/api/dentistas');
  }

  criar(dados: DentistaRequest): Observable<Dentista> {
    return this.http.post<Dentista>('/api/dentistas', dados);
  }

  atualizar(id: number, dados: DentistaRequest): Observable<Dentista> {
    return this.http.put<Dentista>(`/api/dentistas/${id}`, dados);
  }
}
