import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConcluirOnboardingCommandHandler } from "@/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler";

vi.mock("@/core/casosDeUso/onboarding/ConcluirOnboarding");

import { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";

describe("ConcluirOnboardingCommandHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success when use case succeeds", async () => {
    vi.mocked(ConcluirOnboardingUseCase.prototype.executar).mockResolvedValue({
      organizacaoId: "org-123",
    });

    const handler = new ConcluirOnboardingCommandHandler();
    const result = await handler.handle("user-123", {
      displayName: "Test User",
      orgName: "My Org",
    });

    expect(result).toEqual({ success: true, data: { organizacaoId: "org-123" } });
  });

  it("should return error when use case throws", async () => {
    vi.mocked(ConcluirOnboardingUseCase.prototype.executar).mockRejectedValue(
      new Error("Falha")
    );

    const handler = new ConcluirOnboardingCommandHandler();
    const result = await handler.handle("user-123", {
      displayName: "Test User",
      orgName: "My Org",
    });

    expect(result).toEqual({ success: false, error: "Falha" });
  });
});
