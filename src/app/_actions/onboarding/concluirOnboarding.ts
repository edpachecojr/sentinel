"use server";

import { redirect } from "next/navigation";
import { sessionService } from "@/infrastructure/services/SessionService";
import { concluirOnboardingCommand } from "@/core/casosDeUso/onboarding/commands/ConcluirOnboardingCommand";
import { ConcluirOnboardingCommandHandler } from "@/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler";
import { ConcluirOnboardingUseCase } from "@/core/casosDeUso/onboarding/ConcluirOnboarding";
import { OnboardingServico } from "@/core/casosDeUso/onboarding/OnboardingServico";
import { PrismaUnitOfWork } from "@/infrastructure/services/onboarding/PrismaUnitOfWork";
import { PrismaOrganizacaoRepositorio } from "@/infrastructure/repositories/PrismaOrganizacaoRepositorio";
import { PrismaUsuarioRepositorio } from "@/infrastructure/repositories/PrismaUsuarioRepositorio";

export type EstadoOnboarding =
  | { success: true; organizacaoId: string }
  | { success: false; error: string };

export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const user = await sessionService.requireUser();

  const parsed = concluirOnboardingCommand.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  // Composition Root: Instancia toda a cadeia de dependências
  const uow = new PrismaUnitOfWork();
  const organizacaoRepo = new PrismaOrganizacaoRepositorio();
  const usuarioRepo = new PrismaUsuarioRepositorio();

  const onboardingServico = new OnboardingServico(uow, organizacaoRepo, usuarioRepo);
  const useCase = new ConcluirOnboardingUseCase(onboardingServico);
  const handler = new ConcluirOnboardingCommandHandler(useCase);

  const resultado = await handler.handle(user.id, parsed.data);

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/dashboard");
}
