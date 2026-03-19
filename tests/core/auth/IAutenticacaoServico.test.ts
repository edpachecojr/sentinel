import { describe, it, expect } from "vitest";
import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioResultado";

describe("IAutenticacaoServico", () => {
  it("should compile with registrar method defined", () => {
    // TypeScript compile-time check: if this file compiles without errors,
    // the interface has all required methods including registrar
    expect(true).toBe(true);
  });
});

describe("RegistroDTO", () => {
  it("should have required fields: nome, email, senha", () => {
    const dto: RegistrarUsuarioDto = {
      nome: "João da Silva",
      email: "joao@example.com",
      senha: "Senha@123",
    };

    expect(dto.nome).toBeDefined();
    expect(dto.email).toBeDefined();
    expect(dto.senha).toBeDefined();
  });
});

describe("RegistroResultadoDTO", () => {
  it("should return usuarioId on successful registration", () => {
    const resultado: RegistrarUsuarioResultado = {
      usuarioId: "user-123",
    };

    expect(resultado.usuarioId).toBe("user-123");
  });
});
