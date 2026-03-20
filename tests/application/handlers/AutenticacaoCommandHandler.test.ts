import { describe, it, expect, vi, beforeEach } from "vitest";
import { AutenticacaoCommandHandler } from "@/core/casosDeUso/autenticacao/handlers/AutenticacaoCommandHandler";
import type { AutenticarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";

// Mock the dependencies
vi.mock("@/infrastructure/services/autenticacao/AutenticacaoServico");
vi.mock("@/core/casosDeUso/autenticacao/AutenticarUsuario");

import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import { AutenticarUsuarioUseCase } from "@/core/casosDeUso/autenticacao/AutenticarUsuario";

describe("AutenticacaoCommandHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful authentication", async () => {
    vi.mocked(AutenticarUsuarioUseCase.prototype.executar).mockResolvedValue({
      usuarioId: "user-123",
    });

    const handler = new AutenticacaoCommandHandler();
    const data: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await handler.handle(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.usuarioId).toBe("user-123");
    }
  });

  it("should return error response on authentication failure", async () => {
    const error = new Error("Email ou senha incorretos.");
    vi.mocked(AutenticarUsuarioUseCase.prototype.executar).mockRejectedValue(error);

    const handler = new AutenticacaoCommandHandler();
    const data: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await handler.handle(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Email ou senha incorretos.");
    }
  });

  it("should handle unexpected errors gracefully", async () => {
    vi.mocked(AutenticarUsuarioUseCase.prototype.executar).mockRejectedValue(
      new Error("Unexpected error")
    );

    const handler = new AutenticacaoCommandHandler();
    const data: AutenticarUsuarioDto = {
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
