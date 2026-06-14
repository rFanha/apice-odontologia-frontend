import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import {
  ConsultaDashboard,
  DentistaResumo,
  PacienteResumo,
} from '../dashboard/dashboard.service';

export interface ConsultasDados {
  consultas: ConsultaDashboard[];
  pacientes: PacienteResumo[];
  dentistas: DentistaResumo[];
}

@Injectable({
  providedIn: 'root',
})
export class ConsultasService {
  private readonly http = inject(HttpClient);

  carregarDados(): Observable<ConsultasDados> {
    // Carrega os relacionamentos necessarios para exibir nomes na pagina de consultas.
    return forkJoin({
      consultas: this.http.get<ConsultaDashboard[]>('/api/consultas'),
      pacientes: this.http.get<PacienteResumo[]>('/api/pacientes'),
      dentistas: this.http.get<DentistaResumo[]>('/api/dentistas'),
    });
  }
}
