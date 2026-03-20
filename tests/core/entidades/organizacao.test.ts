import { describe, it, expect } from "vitest";
import * as modul from "@/core/entidades/organizacao";
import type { Organizacao } from "@/core/entidades/organizacao";

describe("Organizacao entidade (interface)", () => {
  it("must not export a runtime constructor (should be an interface)", () => {
    // Interfaces are erased at runtime — there should be no constructor function
    expect((modul as any).Organizacao).toBeUndefined();
  });

  it("should allow creating an object that matches the interface", () => {
    const o: Organizacao = { id: "org-1", nome: "Org", slug: "org" };
    expect(o.id).toBe("org-1");
    expect(o.nome).toBe("Org");
  });
});
