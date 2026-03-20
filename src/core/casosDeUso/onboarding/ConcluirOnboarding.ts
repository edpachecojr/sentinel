import type { IOnboardingServico } from "@/core/onboarding/IOnboardingServico";
import type { ConcluirOnboardingDto } from "./dtos/ConcluirOnboardingDto";
import type { ConcluirOnboardingResultado } from "./dtos/ConcluirOnboardingResultado";

export class ConcluirOnboardingUseCase {
  constructor(private readonly onboardingServico: IOnboardingServico) {}

  async executar(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado> {
    if (!userId) throw new Error("User ID é obrigatório para concluir o onboarding.");
    return this.onboardingServico.concluir(userId, dto);
  }
}
