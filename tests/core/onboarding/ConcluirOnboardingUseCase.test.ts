import { describe, it, expect, vi } from "vitest";
import { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";
import type { IOnboardingServico } from "@/core/onboarding/IOnboardingServico";
import type { ConcluirOnboardingDto } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto";

describe("ConcluirOnboardingUseCase", () => {
  it("should throw if userId is missing", async () => {
    const mockServico: IOnboardingServico = {
      concluir: vi.fn(),
    };

    const useCase = new ConcluirOnboardingUseCase(mockServico);

    await expect(useCase.executar("", { displayName: "Test", orgName: "Org" })).rejects.toThrow(
      "User ID é obrigatório para concluir o onboarding."
    );
  });

  it("should delegate to onboarding service", async () => {
    const mockServico: IOnboardingServico = {
      concluir: vi.fn().mockResolvedValue({ organizacaoId: "org-123" }),
    };

    const useCase = new ConcluirOnboardingUseCase(mockServico);
    const dto: ConcluirOnboardingDto = { displayName: "Test", orgName: "Org" };

    const result = await useCase.executar("user-123", dto);

    expect(result.organizacaoId).toBe("org-123");
    expect(mockServico.concluir).toHaveBeenCalledWith("user-123", dto);
  });
});
