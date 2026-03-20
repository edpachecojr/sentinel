import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/infrastructure/lib/db";
import { OnboardingServico } from "@/infrastructure/services/onboarding/OnboardingServico";

describe("OnboardingServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Ensure transaction callback is executed
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback(prisma);
    });
  });

  it("should create organization and update user within a transaction", async () => {
    const service = new OnboardingServico();

    const result = await service.concluir("user-123", {
      displayName: "Test User",
      orgName: "My Org",
    });

    expect(result.organizacaoId).toBeDefined();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.organizacao.create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        nome: "My Org",
        slug: expect.any(String),
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        displayName: "Test User",
        organizacaoId: expect.any(String),
        onboardingCompleted: true,
      },
    });
  });
});
