import type { IAutenticacaoServico } from "@/core/casosDeUso/autenticacao/IAutenticacaoServico";

export class SairUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(): Promise<void> {
    return this.autenticacaoServico.sair();
  }
}
