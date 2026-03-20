import { describe, it, expect } from "vitest";
import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";

describe("IAutenticacaoServico contract", () => {
  it("should accept an object with registrar/autenticar/sair methods", () => {
    const mock: IAutenticacaoServico = {
      registrar: async (_p) => ({ usuarioId: "u1" }),
      autenticar: async (_p) => ({ usuarioId: "u1" }),
      sair: async () => {},
    };

    expect(typeof mock.autenticar).toBe("function");
    expect(typeof mock.registrar).toBe("function");
    expect(typeof mock.sair).toBe("function");
  });
});
