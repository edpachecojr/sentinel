import { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";
import { OnboardingServico } from "@/infrastructure/services/onboarding/OnboardingServico";
import type { ConcluirOnboardingCommand } from "@/application/commands/ConcluirOnboardingCommand";
import type { ConcluirOnboardingResultado } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado";

export type RespostaOnboarding<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ConcluirOnboardingCommandHandler {
  private readonly useCase: ConcluirOnboardingUseCase;

  constructor() {
    const onboardingServico = new OnboardingServico();
    this.useCase = new ConcluirOnboardingUseCase(onboardingServico);
  }

  async handle(
    userId: string,
    dto: ConcluirOnboardingCommand
  ): Promise<RespostaOnboarding<ConcluirOnboardingResultado>> {
    try {
      const resultado = await this.useCase.executar(userId, dto);
      return { success: true, data: resultado };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao concluir onboarding.";
      return { success: false, error: message };
    }
  }
}
