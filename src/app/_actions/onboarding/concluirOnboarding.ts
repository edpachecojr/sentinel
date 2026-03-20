"use server";

import { redirect } from "next/navigation";
import { sessionService } from "@/infrastructure/services/SessionService";
import { concluirOnboardingCommand } from "@/core/casosDeUso/onboarding/commands/ConcluirOnboardingCommand";
import { ConcluirOnboardingCommandHandler } from "@/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler";

export type EstadoOnboarding =
  | { success: true; organizacaoId: string }
  | { success: false; error: string };

export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const user = await sessionService.requireUser();

  const parsed = concluirOnboardingCommand.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const handler = new ConcluirOnboardingCommandHandler();
  const resultado = await handler.handle(user.id, parsed.data);

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/dashboard");
}
