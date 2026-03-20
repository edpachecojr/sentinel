import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';

export class SairHandler {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(): Promise<void> {
    return this.autenticacaoServico.sair();
  }
}
