import { describe, it, expect } from "vitest";
import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";

describe("IAutenticacaoServico contract", () => {
  it("should accept an object with all required methods", () => {
    const mock: IAutenticacaoServico = {
      registrar: async (_p) => ({ usuarioId: "u1" }),
      autenticar: async (_p) => ({ usuarioId: "u1" }),
      sair: async () => {},
      obterSessao: async () => null,
      obterUsuario: async () => ({ id: "u1", email: "test@example.com" }),
      obterOrganizacao: async () => null,
    };

    expect(typeof mock.autenticar).toBe("function");
    expect(typeof mock.registrar).toBe("function");
    expect(typeof mock.sair).toBe("function");
  });
});
