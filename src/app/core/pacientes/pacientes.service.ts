import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Paciente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataCriacao: string;
}

export interface PacienteRequest {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

@Injectable({
  providedIn: 'root',
})
export class PacientesService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>('/api/pacientes');
  }

  criar(dados: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>('/api/pacientes', dados);
  }
}
