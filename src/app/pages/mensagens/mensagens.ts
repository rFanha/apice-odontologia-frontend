import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { extrairMensagemErro } from '../../core/errors/api-error.util';
import { LeadResponse, LeadsService } from '../../core/leads/leads.service';

@Component({
  selector: 'app-mensagens',
  imports: [CommonModule],
  templateUrl: './mensagens.html',
  styleUrl: './mensagens.scss',
})
export class Mensagens implements OnInit {
  private readonly leadsService = inject(LeadsService);

  protected readonly leads      = signal<LeadResponse[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro       = signal('');
  protected readonly sucesso    = signal('');
  protected readonly filtro     = signal<'todos' | 'nao-lidos' | 'lidos'>('todos');
  protected readonly detalhe    = signal<LeadResponse | null>(null);

  protected readonly leadsFiltrados = computed(() => {
    const f = this.filtro();
    const lista = this.leads();
    if (f === 'nao-lidos') return lista.filter((l) => !l.lido);
    if (f === 'lidos')     return lista.filter((l) => l.lido);
    return lista;
  });

  protected readonly resumo = computed(() => {
    const lista = this.leads();
    return {
      total:    lista.length,
      naoLidos: lista.filter((l) => !l.lido).length,
      lidos:    lista.filter((l) => l.lido).length,
    };
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.leadsService.listar().subscribe({
      next: (leads) => {
        this.leads.set(leads);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(extrairMensagemErro(error, 'Não foi possível carregar as mensagens.'));
        this.carregando.set(false);
      },
    });
  }

  protected abrirDetalhe(lead: LeadResponse): void {
    this.detalhe.set(lead);
    if (!lead.lido) {
      this.marcarLido(lead.id);
    }
  }

  protected fecharDetalhe(): void {
    this.detalhe.set(null);
  }

  protected marcarLido(id: number): void {
    this.leadsService.marcarComoLido(id).subscribe({
      next: (atualizado) => {
        this.leads.update((lista) =>
          lista.map((l) => (l.id === id ? atualizado : l)),
        );
        if (this.detalhe()?.id === id) {
          this.detalhe.set(atualizado);
        }
      },
      error: (error: unknown) => {
        this.erro.set(extrairMensagemErro(error, 'Não foi possível marcar como lido.'));
      },
    });
  }

  protected definirFiltro(f: 'todos' | 'nao-lidos' | 'lidos'): void {
    this.filtro.set(f);
  }

  protected formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data));
  }

  protected iniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
  }
}
