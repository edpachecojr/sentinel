import { describe, it, expect, vi } from 'vitest';
import { SairHandler } from '@/core/casosDeUso/autenticacao/sairHandler';
import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';

const mockServico: IAutenticacaoServico = {
  autenticar: vi.fn(),
  registrar: vi.fn(),
  sair: vi.fn().mockResolvedValue(undefined),
  obterSessao: vi.fn(),
  obterUsuario: vi.fn(),
  obterOrganizacao: vi.fn(),
};

describe('SairHandler', () => {
  it('chama sair() no servico', async () => {
    const handler = new SairHandler(mockServico);
    await handler.executar();
    expect(mockServico.sair).toHaveBeenCalled();
  });
});
