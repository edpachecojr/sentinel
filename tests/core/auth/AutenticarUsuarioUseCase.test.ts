import { describe, it, expect, vi } from "vitest";
import { AutenticarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/AutenticarUsuario";
import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";
import type { AutenticarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";

describe("AutenticarUsuarioUseCase", () => {
  it("should delegate to IAutenticacaoServico.autenticar and return result", async () => {
    // Arrange
    const mockServico: IAutenticacaoServico = {
      registrar: vi.fn(),
      autenticar: vi.fn().mockResolvedValue({ usuarioId: "user-123" }),
      sair: vi.fn(),
    };

    const useCase = new AutenticarUsuarioUseCase(mockServico);

    const dto: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    // Act
    const resultado = await useCase.executar(dto);

    // Assert
    expect(resultado.usuarioId).toBe("user-123");
    expect(mockServico.autenticar).toHaveBeenCalledWith(dto);
  });
});
