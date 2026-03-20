import { describe, it, expect, vi } from 'vitest';
import { RegistrarUsuarioHandler } from '@/core/casosDeUso/autenticacao/registrarUsuarioHandler';
import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';

const mockServico: IAutenticacaoServico = {
  autenticar: vi.fn(),
  registrar: vi.fn().mockResolvedValue({ usuarioId: 'new-user-1' }),
  sair: vi.fn(),  obterSessao: vi.fn(),
  obterUsuario: vi.fn(),
  obterOrganizacao: vi.fn(),};

describe('RegistrarUsuarioHandler', () => {
  it('delega ao IAutenticacaoServico.registrar com params corretos', async () => {
    const handler = new RegistrarUsuarioHandler(mockServico);
    const result = await handler.executar({ nome: 'Joao', email: 'j@e.com', senha: 'senha123' });
    expect(mockServico.registrar).toHaveBeenCalledWith({ nome: 'Joao', email: 'j@e.com', senha: 'senha123' });
    expect(result).toEqual({ usuarioId: 'new-user-1' });
  });
});
