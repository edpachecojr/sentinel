import { describe, it, expect, vi, beforeEach } from "vitest";
import { SairCommandHandler } from "@/application/handlers/SairCommandHandler";

// Mock the use case to isolate the handler
vi.mock("@/core/casosDeUso/autenticacao/SairUsuario");

import { SairUsuarioUseCase } from "@/core/casosDeUso/autenticacao/SairUsuario";

describe("SairCommandHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success when use case succeeds", async () => {
    vi.mocked(SairUsuarioUseCase.prototype.executar).mockResolvedValue(undefined);

    const handler = new SairCommandHandler();
    const result = await handler.handle();

    expect(result).toEqual({ success: true });
    expect(SairUsuarioUseCase.prototype.executar).toHaveBeenCalledTimes(1);
  });

  it("should return error when use case throws", async () => {
    vi.mocked(SairUsuarioUseCase.prototype.executar).mockRejectedValue(new Error("Boom"));

    const handler = new SairCommandHandler();
    const result = await handler.handle();

    expect(result).toEqual({ success: false, error: "Boom" });
  });

  it("should return generic error when thrown value is not an Error", async () => {
    vi.mocked(SairUsuarioUseCase.prototype.executar).mockRejectedValue("boom");

    const handler = new SairCommandHandler();
    const result = await handler.handle();

    expect(result).toEqual({ success: false, error: "Erro ao encerrar sessão." });
  });
});
