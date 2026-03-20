import { describe, it, expect, vi, beforeEach } from "vitest";
import { AutenticacaoServico } from "@/infrastructure/services/autenticacao/AutenticacaoServico";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { AutenticarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";

// Mock better-auth
vi.mock("@/infrastructure/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve({})),
  cookies: vi.fn(() => Promise.resolve({
    set: vi.fn(),
  })),
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

describe("AutenticacaoServico.autenticar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should authenticate user and return usuarioId", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ user: mockUser }),
      headers: new Map([["set-cookie", "session=abc123"]]),
    };

    vi.mocked(auth.api.signInEmail).mockResolvedValue(mockResponse as any);

    const servico = new AutenticacaoServico();
    const data: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    const result = await servico.autenticar(data);

    expect(result.usuarioId).toBe("user-123");
    expect(auth.api.signInEmail).toHaveBeenCalledWith({
      body: {
        email: "test@example.com",
        password: "Senha@123",
      },
      headers: expect.anything(),
      asResponse: true,
    });
  });

  it("should throw AuthenticationError when response is not ok", async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({}),
      headers: new Map(),
    };

    vi.mocked(auth.api.signInEmail).mockResolvedValue(mockResponse as any);

    const servico = new AutenticacaoServico();
    const data: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    await expect(servico.autenticar(data)).rejects.toThrow("Email ou senha incorretos.");
  });

  it("should throw AuthenticationError when user data is missing", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ user: null }),
      headers: new Map(),
    };

    vi.mocked(auth.api.signInEmail).mockResolvedValue(mockResponse as any);

    const servico = new AutenticacaoServico();
    const data: AutenticarUsuarioDto = {
      email: "test@example.com",
      senha: "Senha@123",
    };

    await expect(servico.autenticar(data)).rejects.toThrow("Falha ao autenticar usuário.");
  });
});

describe("AutenticacaoServico.sair", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call auth.api.signOut with headers and asResponse", async () => {
    const mockResponse = { ok: true };
    vi.mocked(auth.api.signOut).mockResolvedValue(mockResponse as any);

    const servico = new AutenticacaoServico();
    await servico.sair();

    expect(auth.api.signOut).toHaveBeenCalledWith({
      headers: expect.anything(),
      asResponse: true,
    });
  });

  it("should throw AuthenticationError when signOut fails", async () => {
    const mockResponse = { ok: false };
    vi.mocked(auth.api.signOut).mockResolvedValue(mockResponse as any);

    const servico = new AutenticacaoServico();
    await expect(servico.sair()).rejects.toThrow("Falha ao encerrar sessão.");
  });
});
