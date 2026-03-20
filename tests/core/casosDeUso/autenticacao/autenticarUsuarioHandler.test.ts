import { describe, it, expect, vi } from 'vitest';
import { AutenticarUsuarioHandler } from '@/core/casosDeUso/autenticacao/autenticarUsuarioHandler';
import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';

const mockServico: IAutenticacaoServico = {
  autenticar: vi.fn().mockResolvedValue({ usuarioId: 'user-123' }),
  registrar: vi.fn(),
  sair: vi.fn(),
};

describe('AutenticarUsuarioHandler', () => {
  it('delega ao IAutenticacaoServico com params corretos', async () => {
    const handler = new AutenticarUsuarioHandler(mockServico);
    const result = await handler.executar({ email: 'a@b.com', senha: '12345678' });
    expect(mockServico.autenticar).toHaveBeenCalledWith({ email: 'a@b.com', senha: '12345678' });
    expect(result).toEqual({ usuarioId: 'user-123' });
  });
});
