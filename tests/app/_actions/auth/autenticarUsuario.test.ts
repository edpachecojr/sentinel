import { describe, it, expect } from "vitest";
import { autenticarUsuarioAction } from "@/app/_actions/auth/autenticarUsuario";

describe("autenticarUsuarioAction", () => {
  it("should return error for invalid email", async () => {
    const result = await autenticarUsuarioAction({
      email: "invalid-email",
      password: "Senha@123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should return error for short password", async () => {
    const result = await autenticarUsuarioAction({
      email: "test@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should return error for missing email", async () => {
    const result = await autenticarUsuarioAction({
      email: "",
      password: "Senha@123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});
