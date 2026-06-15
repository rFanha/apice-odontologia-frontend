import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LeadRequest {
  nome: string;
  telefone: string;
  email: string;
  especialidade: string;
  mensagem: string;
}

export interface LeadResponse {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  especialidade: string;
  mensagem: string;
  dataCriacao: string;
  lido: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private readonly http = inject(HttpClient);

  enviar(dados: LeadRequest): Observable<LeadResponse> {
    return this.http.post<LeadResponse>('/api/leads', dados);
  }

  listar(lido?: boolean): Observable<LeadResponse[]> {
    const params = lido !== undefined ? { lido: String(lido) } : undefined;
    return this.http.get<LeadResponse[]>('/api/leads', { params });
  }

  marcarComoLido(id: number): Observable<LeadResponse> {
    return this.http.patch<LeadResponse>(`/api/leads/${id}/lido`, {});
  }
}
