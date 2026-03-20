import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/RegistrarUsuario";
import type { IAutenticacaoServico } from "@/core/casosDeUso/autenticacao/IAutenticacaoServico";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";

describe("RegistrarUsuarioUseCase", () => {
  let mockAutenticacaoServico: IAutenticacaoServico;

  beforeEach(() => {
    mockAutenticacaoServico = {
      registrar: vi.fn().mockResolvedValue({ usuarioId: "user-123" }),
      autenticar: vi.fn(),
      validarSessao: vi.fn(),
      sair: vi.fn(),
      obterUsuarioPorToken: vi.fn(),
    };
  });

  it("should execute registration through authentication service", async () => {
    const useCase = new RegistrarUsuarioUseCase(mockAutenticacaoServico);
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await useCase.executar(data);

    expect(result.usuarioId).toBe("user-123");
    expect(mockAutenticacaoServico.registrar).toHaveBeenCalledWith(data);
  });

  it("should propagate errors from authentication service", async () => {
    vi.mocked(mockAutenticacaoServico.registrar).mockRejectedValue(
      new Error("Email já cadastrado")
    );

    const useCase = new RegistrarUsuarioUseCase(mockAutenticacaoServico);
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    await expect(useCase.executar(data)).rejects.toThrow("Email já cadastrado");
  });
});
