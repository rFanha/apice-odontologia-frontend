import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  path: string;
  label: string;
  perfis: ('ADMIN' | 'DENTISTA')[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Geral',
    items: [{ path: 'dashboard', label: 'Dashboard', perfis: ['ADMIN'] }],
  },
  {
    label: 'Clínica',
    items: [
      { path: 'consultas', label: 'Consultas', perfis: ['ADMIN', 'DENTISTA'] },
      { path: 'pacientes', label: 'Pacientes', perfis: ['ADMIN', 'DENTISTA'] },
      { path: 'dentistas', label: 'Dentistas', perfis: ['ADMIN'] },
      { path: 'especialidades', label: 'Especialidades', perfis: ['ADMIN'] },
    ],
  },
  {
    label: 'Administração',
    items: [
      { path: 'usuarios', label: 'Usuários', perfis: ['ADMIN'] },
      { path: 'relatorios', label: 'Relatórios', perfis: ['ADMIN'] },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  consultas: 'Consultas',
  pacientes: 'Pacientes',
  dentistas: 'Dentistas',
  especialidades: 'Especialidades',
  usuarios: 'Usuários',
  relatorios: 'Relatórios',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private routerSub?: Subscription;

  protected readonly sessao = this.authService.getSessao();
  protected readonly menuAberto = signal(false);

  protected readonly rotaAtual = signal('');

  protected readonly tituloPagina = computed(() => PAGE_TITLES[this.rotaAtual()] ?? '');

  protected readonly navGroups = computed(() => {
    const perfil = this.sessao?.perfil;
    if (!perfil) return [];
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.perfis.includes(perfil)),
    })).filter((group) => group.items.length > 0);
  });

  protected readonly iniciaisUsuario = computed(() => {
    const nome = this.sessao?.nome ?? '';
    return nome.trim().charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    // Atualiza o título da topbar ao mudar de rota.
    this.rotaAtual.set(this.extrairSegmento(this.router.url));
    this.routerSub = this.router.events.subscribe(() => {
      this.rotaAtual.set(this.extrairSegmento(this.router.url));
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  protected fecharMenuMobile(): void {
    this.menuAberto.set(false);
  }

  protected alternarMenu(): void {
    this.menuAberto.update((v) => !v);
  }

  protected sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private extrairSegmento(url: string): string {
    return url.split('/').filter(Boolean)[0] ?? '';
  }
}
