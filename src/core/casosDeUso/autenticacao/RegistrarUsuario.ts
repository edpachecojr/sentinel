import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "./dtos/RegistrarUsuarioResultado";

export class RegistrarUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado> {
    return this.autenticacaoServico.registrar(data);
  }
}
