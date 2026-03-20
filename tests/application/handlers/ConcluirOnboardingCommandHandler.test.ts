import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConcluirOnboardingCommandHandler } from "@/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler";
import type { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";

describe("ConcluirOnboardingCommandHandler (with DI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should inject UseCase via constructor", async () => {
    const mockUseCase = {
      executar: vi.fn().mockResolvedValue({ organizacaoId: "org-123" }),
    } as unknown as ConcluirOnboardingUseCase;

    const handler = new ConcluirOnboardingCommandHandler(mockUseCase);

    const result = await handler.handle("user-123", {
      displayName: "Test User",
      orgName: "My Org",
    });

    expect(result).toEqual({ success: true, data: { organizacaoId: "org-123" } });
    expect(mockUseCase.executar).toHaveBeenCalledWith(
      "user-123",
      expect.objectContaining({ displayName: "Test User", orgName: "My Org" })
    );
  });

  it("should return error when use case throws", async () => {
    const mockUseCase = {
      executar: vi.fn().mockRejectedValue(new Error("Transaction failed")),
    } as unknown as ConcluirOnboardingUseCase;

    const handler = new ConcluirOnboardingCommandHandler(mockUseCase);

    const result = await handler.handle("user-456", {
      displayName: "Test",
      orgName: "Org",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Transaction failed");
  });

  it("should handle generic error", async () => {
    const mockUseCase = {
      executar: vi.fn().mockRejectedValue("Unknown error"),
    } as unknown as ConcluirOnboardingUseCase;

    const handler = new ConcluirOnboardingCommandHandler(mockUseCase);

    const result = await handler.handle("user-789", {
      displayName: "Test",
      orgName: "Org",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Erro inesperado ao concluir onboarding.");
  });
});
