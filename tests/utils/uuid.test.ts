import { describe, it, expect } from "vitest";
import { generateId } from "@/utils/uuid";

describe("generateId()", () => {
  it("deve retornar uma string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("deve retornar um UUID v4 válido", () => {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // onde x é qualquer dígito hex e y é 8, 9, A, ou B
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const id = generateId();
    expect(uuidPattern.test(id)).toBe(true);
  });

  it("deve gerar IDs únicos a cada chamada", () => {
    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it("deve ter comprimento correto (36 caracteres com hyphens)", () => {
    const id = generateId();
    expect(id.length).toBe(36);
    expect(id.split("-").length).toBe(5);
  });

  it("deve ser apropriado para usar como ID de banco de dados", () => {
    const id = generateId();
    // Não contém caracteres especiais perigosos para SQL
    expect(/^[0-9a-f-]+$/i.test(id)).toBe(true);
  });
});
