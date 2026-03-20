import type { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";
import type { ConcluirOnboardingCommand } from "@/core/casosDeUso/onboarding/commands/ConcluirOnboardingCommand";
import type { ConcluirOnboardingResultado } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado";

export type RespostaOnboarding<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ConcluirOnboardingCommandHandler {
  constructor(private readonly useCase: ConcluirOnboardingUseCase) {}

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
