import type { ConcluirOnboardingDto } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto";
import type { ConcluirOnboardingResultado } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado";

export interface IOnboardingServico {
  concluir(userId: string, dto: ConcluirOnboardingDto): Promise<ConcluirOnboardingResultado>;
}
