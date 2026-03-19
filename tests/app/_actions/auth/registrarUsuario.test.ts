import { describe, it, expect } from "vitest";
import { registrarUsuarioAction } from "@/app/_actions/auth/registrarUsuario";

describe("registrarUsuarioAction", () => {
  it("should return error for invalid email", async () => {
    const result = await registrarUsuarioAction({
      name: "Test User",
      email: "invalid-email",
      password: "Senha@123",
      confirmPassword: "Senha@123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should return error for short name", async () => {
    const result = await registrarUsuarioAction({
      name: "A",
      email: "test@example.com",
      password: "Senha@123",
      confirmPassword: "Senha@123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should return error when passwords do not match", async () => {
    const result = await registrarUsuarioAction({
      name: "Test User",
      email: "test@example.com",
      password: "Senha@123",
      confirmPassword: "Different@123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});
