import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';
import type { RegistrarUsuarioCommand, RegistrarUsuarioResult } from './registrarUsuario.command';

export class RegistrarUsuarioHandler {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(command: RegistrarUsuarioCommand): Promise<RegistrarUsuarioResult> {
    return this.autenticacaoServico.registrar({
      nome: command.nome,
      email: command.email,
      senha: command.senha,
    });
  }
}
