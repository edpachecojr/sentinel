import { describe, it, expect, vi } from "vitest";
import { SairUsuarioUseCase } from "@/core/casosDeUso/autenticacao/SairUsuario";
import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";

describe("SairUsuarioUseCase", () => {
  it("should call sair() on the authentication service", async () => {
    const mockServico: IAutenticacaoServico = {
      registrar: vi.fn(),
      autenticar: vi.fn(),
      validarSessao: vi.fn(),
      sair: vi.fn().mockResolvedValue(undefined),
      obterUsuarioPorToken: vi.fn(),
    };

    const useCase = new SairUsuarioUseCase(mockServico);

    await useCase.executar();

    expect(mockServico.sair).toHaveBeenCalledTimes(1);
  });

  it("should propagate errors from the authentication service", async () => {
    const mockServico: IAutenticacaoServico = {
      registrar: vi.fn(),
      autenticar: vi.fn(),
      validarSessao: vi.fn(),
      sair: vi.fn().mockRejectedValue(new Error("Falha ao encerrar sessão")),
      obterUsuarioPorToken: vi.fn(),
    };

    const useCase = new SairUsuarioUseCase(mockServico);

    await expect(useCase.executar()).rejects.toThrow("Falha ao encerrar sessão");
  });
});
