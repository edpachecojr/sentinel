import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";
import type { AutenticarUsuarioDto } from "./dtos/AutenticarUsuarioDto";
import type { AutenticarUsuarioResultado } from "./dtos/AutenticarUsuarioResultado";

export class AutenticarUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado> {
    return this.autenticacaoServico.autenticar(dto);
  }
}
