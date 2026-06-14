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

@Injectable({
  providedIn: 'root',
})
export class PacientesService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>('/api/pacientes');
  }
}
