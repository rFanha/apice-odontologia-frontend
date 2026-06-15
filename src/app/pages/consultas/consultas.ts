import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { ConsultaRequest, ConsultasDados, ConsultasService } from '../../core/consultas/consultas.service';
import { extrairMensagemErro } from '../../core/errors/api-error.util';
import { ConsultaDashboard, StatusConsulta } from '../../core/dashboard/dashboard.service';

type ConsultaListada = ConsultaDashboard & {
  pacienteNome: string;
  dentistaNome: string;
};

@Component({
  selector: 'app-consultas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class Consultas implements OnInit {
  private readonly consultasService = inject(ConsultasService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly erroModalConsulta = signal('');
  protected readonly dataHoraPassada = signal(false);
  protected readonly sucesso = signal('');
  protected readonly salvando = signal(false);
  protected readonly modalAberto = signal(false);
  protected readonly consultaEmEdicao = signal<ConsultaDashboard | null>(null);
  protected readonly cancelando = signal(false);
  protected readonly modalCancelamentoAberto = signal(false);
  protected readonly consultaEmCancelamento = signal<ConsultaListada | null>(null);
  protected readonly dados = signal<ConsultasDados | null>(null);
  protected readonly usuario = this.authService.getSessao();
  protected readonly filtroPaciente = signal('');
  protected readonly filtroDentista = signal('');
  protected readonly filtroStatus = signal<'todos' | StatusConsulta>('todos');
  protected readonly filtroData = signal('');
  protected readonly horarios = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ];
  protected readonly duracoes = [
    { valor: 30, label: '30 minutos' },
    { valor: 45, label: '45 minutos' },
    { valor: 60, label: '1 hora' },
    { valor: 90, label: '1h30' },
  ];
  protected readonly statusOptions: { valor: StatusConsulta; label: string }[] = [
    { valor: 'AGENDADA',   label: 'Agendada' },
    { valor: 'FINALIZADA', label: 'Finalizada' },
    { valor: 'CANCELADA',  label: 'Cancelada' },
  ];

  protected readonly consultaForm = this.formBuilder.nonNullable.group({
    pacienteId: ['', Validators.required],
    dentistaId: ['', Validators.required],
    data: [this.getDataAtual(), Validators.required],
    horaInicio: ['09:00', Validators.required],
    duracao: [60, [Validators.required, Validators.min(15)]],
    descricao: ['', [Validators.required, Validators.minLength(3)]],
    status: ['AGENDADA' as StatusConsulta, Validators.required],
  });
  protected readonly cancelamentoForm = this.formBuilder.nonNullable.group({
    motivoCancelamento: ['', [Validators.required, Validators.minLength(5)]],
  });

  protected readonly resumoStatus = computed(() => {
    const consultas = this.dados()?.consultas ?? [];

    return {
      total: consultas.length,
      agendadas: consultas.filter((consulta) => consulta.status === 'AGENDADA').length,
      finalizadas: consultas.filter((consulta) => consulta.status === 'FINALIZADA').length,
      canceladas: consultas.filter((consulta) => consulta.status === 'CANCELADA').length,
    };
  });

  protected readonly consultasListadas = computed(() => {
    const dados = this.dados();

    if (!dados) {
      return [];
    }

    const pacientes = new Map(dados.pacientes.map((paciente) => [paciente.id, paciente.nome]));
    const dentistas = new Map(dados.dentistas.map((dentista) => [dentista.id, dentista.nome]));
    const pacienteId = this.filtroPaciente();
    const dentistaId = this.filtroDentista();
    const status = this.filtroStatus();
    const data = this.filtroData();

    // Enriquecemos os registros com nomes para evitar logica repetida no template.
    return dados.consultas
      .filter((consulta) => !pacienteId || consulta.pacienteId === Number(pacienteId))
      .filter((consulta) => !dentistaId || consulta.dentistaId === Number(dentistaId))
      .filter((consulta) => status === 'todos' || consulta.status === status)
      .filter((consulta) => !data || consulta.dataInicio.slice(0, 10) === data)
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .map((consulta) => ({
        ...consulta,
        pacienteNome: pacientes.get(consulta.pacienteId) ?? 'Paciente não encontrado',
        dentistaNome: dentistas.get(consulta.dentistaId) ?? 'Dentista não encontrado',
      }));
  });

  protected readonly pacientes = computed(() => this.dados()?.pacientes ?? []);
  protected readonly dentistas = computed(() => this.dados()?.dentistas ?? []);

  ngOnInit(): void {
    this.carregarConsultas();
  }

  protected carregarConsultas(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.consultasService.carregarDados().subscribe({
      next: (dados) => {
        this.dados.set(dados);
        this.definirDentistaPadrao();
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.getMensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  protected perfilLabel(): string {
    return this.usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Dentista';
  }

  protected statusLabel(status: StatusConsulta): string {
    const labels: Record<StatusConsulta, string> = {
      AGENDADA: 'Agendada',
      CANCELADA: 'Cancelada',
      FINALIZADA: 'Finalizada',
    };

    return labels[status];
  }

  protected abrirModalConsulta(): void {
    this.erro.set('');
    this.erroModalConsulta.set('');
    this.dataHoraPassada.set(false);
    this.sucesso.set('');
    this.consultaEmEdicao.set(null);
    this.consultaForm.reset({
      pacienteId: '',
      dentistaId: '',
      data: this.getDataAtual(),
      horaInicio: '09:00',
      duracao: 60,
      descricao: '',
      status: 'AGENDADA',
    });
    this.definirDentistaPadrao();
    this.modalAberto.set(true);
  }

  protected abrirModalEdicao(consulta: ConsultaListada): void {
    const dataInicio = new Date(consulta.dataInicio);
    const dataFim = new Date(consulta.dataFim);
    const duracao = Math.max(15, Math.round((dataFim.getTime() - dataInicio.getTime()) / 60000));

    this.erro.set('');
    this.erroModalConsulta.set('');
    this.dataHoraPassada.set(false);
    this.sucesso.set('');
    this.consultaEmEdicao.set(consulta);
    this.consultaForm.reset({
      pacienteId: String(consulta.pacienteId),
      dentistaId: String(consulta.dentistaId),
      data: consulta.dataInicio.slice(0, 10),
      horaInicio: this.formatarHora(dataInicio),
      duracao,
      descricao: consulta.descricao,
      status: consulta.status,
    });
    this.modalAberto.set(true);
  }

  protected fecharModalConsulta(): void {
    if (this.salvando()) {
      return;
    }

    this.modalAberto.set(false);
    this.erroModalConsulta.set('');
    this.dataHoraPassada.set(false);
  }

  protected abrirModalCancelamento(consulta: ConsultaListada): void {
    this.erro.set('');
    this.sucesso.set('');

    if (!this.podeCancelar(consulta)) {
      this.erro.set('Somente consultas agendadas podem ser canceladas.');
      return;
    }

    this.consultaEmCancelamento.set(consulta);
    this.cancelamentoForm.reset({ motivoCancelamento: '' });
    this.modalCancelamentoAberto.set(true);
  }

  protected fecharModalCancelamento(): void {
    if (this.cancelando()) {
      return;
    }

    this.modalCancelamentoAberto.set(false);
    this.consultaEmCancelamento.set(null);
  }

  protected cancelarConsulta(): void {
    const consulta = this.consultaEmCancelamento();

    this.erro.set('');
    this.sucesso.set('');
    this.cancelamentoForm.markAllAsTouched();

    if (!consulta || this.cancelamentoForm.invalid) {
      this.erro.set('Informe o motivo do cancelamento.');
      return;
    }

    this.cancelando.set(true);

    // Envia apenas o motivo; o backend controla a mudanca de status da consulta.
    this.consultasService
      .cancelarConsulta(consulta.id, {
        motivoCancelamento: this.cancelamentoForm.controls.motivoCancelamento.value.trim(),
      })
      .subscribe({
        next: () => {
          this.sucesso.set('Consulta cancelada com sucesso.');
          this.cancelando.set(false);
          this.fecharModalCancelamento();
          this.carregarConsultas();
        },
        error: (error: unknown) => {
          this.erro.set(this.getMensagemErro(error));
          this.cancelando.set(false);
        },
      });
  }

  protected salvarConsulta(): void {
    this.erro.set('');
    this.erroModalConsulta.set('');
    this.dataHoraPassada.set(false);
    this.sucesso.set('');
    this.consultaForm.markAllAsTouched();

    if (this.consultaForm.invalid) {
      this.erroModalConsulta.set('Preencha os dados obrigatórios para agendar a consulta.');
      return;
    }

    const consultaAtual = this.consultaEmEdicao();
    const payload = this.montarPayloadConsulta(consultaAtual);

    if (!consultaAtual && new Date(payload.dataInicio).getTime() < Date.now()) {
      this.dataHoraPassada.set(true);
      this.erroModalConsulta.set('Não é permitido agendar consulta em data ou horário passado.');
      return;
    }

    this.salvando.set(true);

    const operacao$ = consultaAtual
      ? this.consultasService.atualizarConsulta(consultaAtual.id, payload)
      : this.consultasService.criarConsulta(payload);

    operacao$.subscribe({
        next: () => {
          this.sucesso.set(consultaAtual ? 'Consulta atualizada com sucesso.' : 'Consulta agendada com sucesso.');
          this.consultaEmEdicao.set(null);
          this.modalAberto.set(false);
          this.salvando.set(false);
          this.carregarConsultas();
        },
        error: (error: unknown) => {
          this.erroModalConsulta.set(this.getMensagemErro(error));
          this.salvando.set(false);
        },
      });
  }

  protected validarDataHoraConsulta(): void {
    this.erroModalConsulta.set('');
    this.dataHoraPassada.set(false);

    if (this.consultaEmEdicao()) {
      return;
    }

    const { data, horaInicio } = this.consultaForm.getRawValue();

    if (!data || !horaInicio) {
      return;
    }

    if (this.montarDataHora(data, horaInicio).getTime() < Date.now()) {
      this.dataHoraPassada.set(true);
      this.erroModalConsulta.set('Não é permitido agendar consulta em data ou horário passado.');
    }
  }

  protected tituloModalConsulta(): string {
    return this.consultaEmEdicao() ? 'Editar consulta' : 'Agendar consulta';
  }

  protected subtituloModalConsulta(): string {
    return this.consultaEmEdicao()
      ? 'Atualize os dados do agendamento.'
      : 'Preencha os dados do novo agendamento.';
  }

  protected textoBotaoSalvar(): string {
    if (this.salvando()) {
      return this.consultaEmEdicao() ? 'Salvando...' : 'Agendando...';
    }

    return this.consultaEmEdicao() ? 'Salvar alterações' : 'Confirmar agendamento';
  }

  protected campoInvalido(campo: keyof typeof this.consultaForm.controls): boolean {
    const control = this.consultaForm.controls[campo];

    return control.invalid && (control.dirty || control.touched);
  }

  protected motivoCancelamentoInvalido(): boolean {
    const control = this.cancelamentoForm.controls.motivoCancelamento;

    return control.invalid && (control.dirty || control.touched);
  }

  protected podeCancelar(consulta: ConsultaDashboard): boolean {
    return consulta.status === 'AGENDADA';
  }

  protected formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data));
  }

  protected trackConsulta(_: number, consulta: ConsultaDashboard): number {
    return consulta.id;
  }

  protected atualizarFiltroPaciente(event: Event): void {
    this.filtroPaciente.set((event.target as HTMLSelectElement).value);
  }

  protected atualizarFiltroDentista(event: Event): void {
    this.filtroDentista.set((event.target as HTMLSelectElement).value);
  }

  protected atualizarFiltroStatus(event: Event): void {
    this.filtroStatus.set((event.target as HTMLSelectElement).value as 'todos' | StatusConsulta);
  }

  protected atualizarFiltroData(event: Event): void {
    this.filtroData.set((event.target as HTMLInputElement).value);
  }

  protected limparFiltros(): void {
    this.filtroPaciente.set('');
    this.filtroDentista.set('');
    this.filtroStatus.set('todos');
    this.filtroData.set('');
  }

  private definirDentistaPadrao(): void {
    const dentistas = this.dentistas();

    if (this.usuario?.perfil === 'DENTISTA' && dentistas.length === 1) {
      this.consultaForm.controls.dentistaId.setValue(String(dentistas[0].id));
    }
  }

  private montarDataHora(data: string, hora: string): Date {
    return new Date(`${data}T${hora}:00`);
  }

  private formatarLocalDateTime(data: Date): string {
    // Envia LocalDateTime sem timezone para combinar com o DTO do backend Spring.
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}:00`;
  }

  private getDataAtual(): string {
    return this.formatarLocalDateTime(new Date()).slice(0, 10);
  }

  private montarPayloadConsulta(consultaAtual: ConsultaDashboard | null): ConsultaRequest {
    const form = this.consultaForm.getRawValue();
    const dataInicio = this.montarDataHora(form.data, form.horaInicio);
    const dataFim = new Date(dataInicio.getTime() + Number(form.duracao) * 60000);

    return {
      pacienteId: Number(form.pacienteId),
      dentistaId: Number(form.dentistaId),
      descricao: form.descricao.trim(),
      motivoCancelamento: consultaAtual?.motivoCancelamento ?? null,
      dataInicio: this.formatarLocalDateTime(dataInicio),
      dataFim: this.formatarLocalDateTime(dataFim),
      status: form.status as StatusConsulta,
    };
  }

  private formatarHora(data: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${pad(data.getHours())}:${pad(data.getMinutes())}`;
  }

  private getMensagemErro(error: unknown): string {
    return extrairMensagemErro(error, 'Não foi possível concluir a operação de consulta.');
  }

}
