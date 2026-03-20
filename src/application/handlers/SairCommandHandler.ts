import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import { SairUsuarioUseCase } from "@/core/casosDeUso/autenticacao/SairUsuario";

export type RespostaSair = { success: true } | { success: false; error: string };

export class SairCommandHandler {
  private readonly useCase: SairUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new SairUsuarioUseCase(autenticacaoServico);
  }

  async handle(): Promise<RespostaSair> {
    try {
      await this.useCase.executar();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao encerrar sessão.";
      return { success: false, error: message };
    }
  }
}
