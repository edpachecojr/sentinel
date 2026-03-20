import { describe, it, expect } from "vitest";
import * as mod from "@/core/entidades/usuario";
import type { Usuario } from "@/core/entidades/usuario";

describe("Usuario entidade (interface)", () => {
  it("must not export a runtime constructor (should be an interface)", () => {
    expect((mod as any).Usuario).toBeUndefined();
  });

  it("should allow creating an object that matches the interface", () => {
    const u: Usuario = {
      id: "user-1",
      displayName: "User",
      email: "u@example.com",
      onboardingCompleted: false,
    };

    expect(u.email).toBe("u@example.com");
    expect(u.onboardingCompleted).toBe(false);
  });
});
