import { describe, it, expect, vi, beforeEach } from "vitest";
import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";

// Mock better-auth
vi.mock("@/infrastructure/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve({})),
}));

import { auth } from "@/infrastructure/lib/auth";

describe("AutenticacaoServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user and return usuarioId", async () => {
    const mockUser = { id: "user-123", email: "test@example.com", name: "Test User" };
    vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: mockUser } as any);

    const servico = new AutenticacaoServico();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await servico.registrar(data);

    expect(result.usuarioId).toBe("user-123");
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "Senha@123",
      },
      headers: expect.anything(),
    });
  });

  it("should throw error when signUpEmail fails", async () => {
    vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: null } as any);

    const servico = new AutenticacaoServico();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    await expect(servico.registrar(data)).rejects.toThrow("Falha ao registrar usuário.");
  });

  it("should throw error when user creation fails", async () => {
    vi.mocked(auth.api.signUpEmail).mockRejectedValue(new Error("Database error"));

    const servico = new AutenticacaoServico();
    const data: RegistrarUsuarioDto = {
      nome: "Test User",
      email: "test@example.com",
      senha: "Senha@123",
    };

    await expect(servico.registrar(data)).rejects.toThrow("Database error");
  });
});
