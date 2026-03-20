import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import { AutenticarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/AutenticarUsuario";
import type { AutenticarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";

export type RespostaAutenticacao<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class AutenticacaoCommandHandler {
  private readonly useCase: AutenticarUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new AutenticarUsuarioUseCase(autenticacaoServico);
  }

  async handle(dto: AutenticarUsuarioDto): Promise<RespostaAutenticacao<{ usuarioId: string }>> {
    try {
      const resultado = await this.useCase.executar(dto);
      return { success: true, data: { usuarioId: resultado.usuarioId } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao autenticar.";
      return { success: false, error: message };
    }
  }
}
