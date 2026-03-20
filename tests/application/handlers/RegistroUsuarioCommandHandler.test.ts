import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistroUsuarioCommandHandler } from "@/application/handlers/RegistroUsuarioCommandHandler";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";

// Mock the dependencies
vi.mock("@/infrastructure/services/autenticacao/AutenticacaoServico");
vi.mock("@/core/casosDeUso/autenticacao/RegistrarUsuario");

import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import { RegistrarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/RegistrarUsuario";

describe("RegistroUsuarioCommandHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful registration", async () => {
    vi.mocked(RegistrarUsuarioUseCase.prototype.executar).mockResolvedValue({
      usuarioId: "user-123",
    });

    const handler = new RegistroUsuarioCommandHandler();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await handler.handle(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.usuarioId).toBe("user-123");
    }
  });

  it("should return error response on registration failure", async () => {
    const error = new Error("Email já cadastrado");
    vi.mocked(RegistrarUsuarioUseCase.prototype.executar).mockRejectedValue(error);

    const handler = new RegistroUsuarioCommandHandler();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await handler.handle(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Email já cadastrado");
    }
  });

  it("should handle unexpected errors gracefully", async () => {
    vi.mocked(RegistrarUsuarioUseCase.prototype.executar).mockRejectedValue(
      new Error("Unexpected error")
    );

    const handler = new RegistroUsuarioCommandHandler();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await handler.handle(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unexpected error");
    }
  });
});
