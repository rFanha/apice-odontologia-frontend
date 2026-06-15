import { HttpErrorResponse } from '@angular/common/http';

// Extrai mensagem legivel de erros HTTP vindos da API.
export function extrairMensagemErro(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.';
  }

  if (error.status === 401) {
    return 'Sessao expirada. Faca login novamente.';
  }

  if (error.status === 403) {
    return 'Seu usuario nao tem permissao para realizar esta operacao.';
  }

  if (typeof error.error?.message === 'string') {
    return error.error.message;
  }

  if (typeof error.error?.error === 'string') {
    return error.error.error;
  }

  return fallback;
}
