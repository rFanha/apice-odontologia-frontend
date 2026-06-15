import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

type ThemeMode = 'light' | 'dark' | 'system';

interface NavItem {
  path: string;
  label: string;
  crumb: string;
  icon: string;
  perfis: ('ADMIN' | 'DENTISTA')[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Geral',
    items: [
      {
        path: 'dashboard', label: 'Dashboard', crumb: 'Visão geral',
        icon: 'M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM14 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zM14 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z',
        perfis: ['ADMIN'],
      },
    ],
  },
  {
    label: 'Clínica',
    items: [
      {
        path: 'consultas', label: 'Consultas', crumb: 'Agendamentos',
        icon: 'M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
        perfis: ['ADMIN', 'DENTISTA'],
      },
      {
        path: 'pacientes', label: 'Pacientes', crumb: 'Cadastro de pacientes',
        icon: 'M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
        perfis: ['ADMIN', 'DENTISTA'],
      },
      {
        path: 'dentistas', label: 'Dentistas', crumb: 'Equipe clínica',
        icon: 'M17 20H7a2 2 0 0 1-2-2v-1c0-2.8 2.2-5 5-5h4c2.8 0 5 2.2 5 5v1a2 2 0 0 1-2 2zM12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
        perfis: ['ADMIN'],
      },
      {
        path: 'especialidades', label: 'Especialidades', crumb: 'Configuração clínica',
        icon: 'M12 2l8 4v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-4z',
        perfis: ['ADMIN'],
      },
    ],
  },
  {
    label: 'Administração',
    items: [
      {
        path: 'usuarios', label: 'Usuários', crumb: 'Controle de acesso',
        icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
        perfis: ['ADMIN'],
      },
      {
        path: 'relatorios', label: 'Relatórios', crumb: 'Análises e filtros',
        icon: 'M18 20V10M12 20V4M6 20v-6',
        perfis: ['ADMIN'],
      },
      {
        path: 'mensagens', label: 'Mensagens', crumb: 'Solicitações de agendamento',
        icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        perfis: ['ADMIN'],
      },
    ],
  },
];

const PAGE_META: Record<string, { titulo: string; crumb: string }> = {
  dashboard:      { titulo: 'Dashboard',      crumb: 'Visão geral' },
  consultas:      { titulo: 'Consultas',      crumb: 'Agendamentos' },
  pacientes:      { titulo: 'Pacientes',      crumb: 'Cadastro de pacientes' },
  dentistas:      { titulo: 'Dentistas',      crumb: 'Equipe clínica' },
  especialidades: { titulo: 'Especialidades', crumb: 'Configuração clínica' },
  usuarios:       { titulo: 'Usuários',       crumb: 'Controle de acesso' },
  relatorios:     { titulo: 'Relatórios',     crumb: 'Análises e filtros' },
  mensagens:      { titulo: 'Mensagens',      crumb: 'Solicitações de agendamento' },
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

  protected readonly sessao       = this.authService.getSessao();
  protected readonly menuAberto   = signal(false);
  protected readonly rotaAtual    = signal('');
  protected readonly themeMode    = signal<ThemeMode>('system');

  protected readonly paginaMeta = computed(
    () => PAGE_META[this.rotaAtual()] ?? { titulo: '', crumb: '' },
  );

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
    const saved = (localStorage.getItem('apice-theme') ?? 'system') as ThemeMode;
    this.themeMode.set(saved);
    this.aplicarTema(saved);
    this.rotaAtual.set(this.extrairSegmento(this.router.url));
    this.routerSub = this.router.events.subscribe(() => {
      this.rotaAtual.set(this.extrairSegmento(this.router.url));
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  protected fecharMenuMobile(): void { this.menuAberto.set(false); }
  protected alternarMenu(): void     { this.menuAberto.update((v) => !v); }

  protected alternarTema(): void {
    const ordem: ThemeMode[] = ['light', 'dark', 'system'];
    const atual   = this.themeMode();
    const proximo = ordem[(ordem.indexOf(atual) + 1) % 3];
    this.themeMode.set(proximo);
    localStorage.setItem('apice-theme', proximo);
    this.aplicarTema(proximo);
  }

  protected sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private extrairSegmento(url: string): string {
    return url.split('/').filter(Boolean)[0] ?? '';
  }

  private aplicarTema(modo: ThemeMode): void {
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const efetivo = modo === 'system' ? sys : modo;
    document.documentElement.setAttribute('data-theme', efetivo);
  }
}
