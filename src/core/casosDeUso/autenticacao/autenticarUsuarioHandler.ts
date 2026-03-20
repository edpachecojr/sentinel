import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';
import type { AutenticarUsuarioCommand, AutenticarUsuarioResult } from './autenticarUsuario.command';

export class AutenticarUsuarioHandler {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(command: AutenticarUsuarioCommand): Promise<AutenticarUsuarioResult> {
    return this.autenticacaoServico.autenticar({
      email: command.email,
      senha: command.senha,
    });
  }
}
