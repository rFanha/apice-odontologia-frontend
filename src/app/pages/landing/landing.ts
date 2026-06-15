import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LeadsService } from '../../core/leads/leads.service';

type ThemeMode = 'light' | 'dark' | 'system';

interface Servico { titulo: string; descricao: string; path: string; }
interface Membro  { nome: string; especialidade: string; cro: string; foto: string; }
interface Depoimento { texto: string; nome: string; papel: string; }

const SERVICOS: Servico[] = [
  { titulo: 'Implantodontia',        descricao: 'Reposição de dentes com implantes de titânio e carga imediata.',              path: 'M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.8 5.7 21l2.3-7.2-6-4.4h7.6z' },
  { titulo: 'Ortodontia',            descricao: 'Aparelhos fixos, autoligados e alinhadores invisíveis.',                       path: 'M4 7h16M7 7v4a5 5 0 0 0 10 0V7' },
  { titulo: 'Clareamento',           descricao: 'Clareamento dental a laser e supervisionado em casa.',                          path: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z' },
  { titulo: 'Odontopediatria',       descricao: 'Cuidado especializado e lúdico para o sorriso das crianças.',                  path: 'M9 11a3 3 0 1 1 6 0c0 4-3 7-3 7s-3-3-3-7z' },
  { titulo: 'Endodontia',            descricao: 'Tratamento de canal indolor com tecnologia rotatória.',                         path: 'M12 2C9 6 7 9 7 13a5 5 0 0 0 10 0c0-4-2-7-5-11z' },
  { titulo: 'Próteses & Estética',   descricao: 'Lentes de contato dental, facetas e próteses fixas.',                          path: 'M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7z' },
  { titulo: 'Periodontia',           descricao: 'Saúde da gengiva, raspagem e tratamento periodontal.',                         path: 'M3 12h4l2 6 4-14 2 8h6' },
  { titulo: 'Harmonização Orofacial',descricao: 'Procedimentos estéticos faciais por dentistas habilitados.',                   path: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z' },
];

const EQUIPE: Membro[] = [
  { nome: 'Dra. Helena Rocha',   especialidade: 'Implantodontia',  cro: 'CRO-SP 54.210', foto: 'assets/4.avif' },
  { nome: 'Dr. Marcelo Tavares', especialidade: 'Ortodontia',      cro: 'CRO-SP 61.882', foto: 'assets/5.avif' },
  { nome: 'Dra. Beatriz Lemos',  especialidade: 'Odontopediatria', cro: 'CRO-SP 72.045', foto: 'assets/6.avif' },
  { nome: 'Dr. André Sampaio',   especialidade: 'Endodontia',      cro: 'CRO-SP 49.317', foto: 'assets/7.avif' },
];

const DEPOIMENTOS: Depoimento[] = [
  { texto: 'Fui muito bem acolhida desde a recepção. O resultado do meu implante superou as expectativas.', nome: 'Patrícia M.',  papel: 'Paciente de Implante' },
  { texto: 'Levo meu filho sem drama nenhum. A equipe de odontopediatria é simplesmente encantadora.',      nome: 'Rodrigo A.',   papel: 'Pai do Théo, 6 anos' },
  { texto: 'Estrutura impecável e profissionais que explicam cada etapa. Recomendo de olhos fechados.',     nome: 'Carla S.',     papel: 'Tratamento ortodôntico' },
];

@Component({
  selector: 'app-landing',
  imports: [RouterLink, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  private readonly leadsService = inject(LeadsService);

  protected readonly scrolled    = signal(false);
  protected readonly formOk      = signal(false);
  protected readonly formErro    = signal(false);
  protected readonly enviando    = signal(false);
  protected readonly themeMode   = signal<ThemeMode>('system');

  protected readonly servicos    = SERVICOS;
  protected readonly equipe      = EQUIPE;
  protected readonly depoimentos = DEPOIMENTOS;

  protected formData = this.formVazio();

  ngOnInit(): void {
    const saved = (localStorage.getItem('apice-theme') ?? 'system') as ThemeMode;
    this.themeMode.set(saved);
    this.aplicarTema(saved);
    this.onScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  protected alternarTema(): void {
    const ordem: ThemeMode[] = ['light', 'dark', 'system'];
    const atual = this.themeMode();
    const proximo = ordem[(ordem.indexOf(atual) + 1) % 3];
    this.themeMode.set(proximo);
    localStorage.setItem('apice-theme', proximo);
    this.aplicarTema(proximo);
  }

  protected enviarFormulario(event: Event): void {
    event.preventDefault();
    this.formOk.set(false);
    this.formErro.set(false);
    this.enviando.set(true);

    this.leadsService.enviar(this.formData).subscribe({
      next: () => {
        this.formOk.set(true);
        this.formData = this.formVazio();
        this.enviando.set(false);
      },
      error: () => {
        this.formErro.set(true);
        this.enviando.set(false);
      },
    });
  }

  protected inicial(nome: string): string {
    return nome.trim().charAt(0).toUpperCase();
  }

  protected avatarCor(nome: string): string {
    const cores = ['#808744', '#3fa87b', '#6ed6a4', '#8ec46c'];
    return cores[nome.charCodeAt(0) % cores.length];
  }

  private formVazio() {
    return { nome: '', telefone: '', email: '', especialidade: '', mensagem: '' };
  }

  private aplicarTema(modo: ThemeMode): void {
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const efetivo = modo === 'system' ? sys : modo;
    document.documentElement.setAttribute('data-theme', efetivo);
  }
}
