import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";

export class SairUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(): Promise<void> {
    return this.autenticacaoServico.sair();
  }
}
