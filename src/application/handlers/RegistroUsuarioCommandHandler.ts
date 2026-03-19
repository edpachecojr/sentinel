import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import { RegistrarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/RegistrarUsuario";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";

export type RespostaRegistro<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class RegistroUsuarioCommandHandler {
  private readonly useCase: RegistrarUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new RegistrarUsuarioUseCase(autenticacaoServico);
  }

  async handle(data: RegistrarUsuarioDto): Promise<RespostaRegistro<{ usuarioId: string }>> {
    try {
      const resultado = await this.useCase.executar(data);
      return { success: true, data: { usuarioId: resultado.usuarioId } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao registrar.";
      return { success: false, error: message };
    }
  }
}
