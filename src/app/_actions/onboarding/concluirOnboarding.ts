"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sessionService } from "@/infrastructure/services/SessionService";
import { ConcluirOnboardingHandler } from "@/core/casosDeUso/onboarding/concluirOnboardingHandler";
import { PrismaUnitOfWork } from "@/infrastructure/services/onboarding/PrismaUnitOfWork";
import { PrismaOrganizacaoRepositorio } from "@/infrastructure/repositories/PrismaOrganizacaoRepositorio";
import { PrismaUsuarioRepositorio } from "@/infrastructure/repositories/PrismaUsuarioRepositorio";

const schema = z.object({
  orgName: z.string().min(1, { message: "Nome da organização é obrigatório" }),
  displayName: z.string().min(1, { message: "Nome de exibição é obrigatório" }),
});

export type EstadoOnboarding =
  | { success: true; organizacaoId: string }
  | { success: false; error: string };

export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const user = await sessionService.requireUser();

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  // Composition Root: Instancia toda a cadeia de dependências
  const uow = new PrismaUnitOfWork();
  const organizacaoRepo = new PrismaOrganizacaoRepositorio();
  const usuarioRepo = new PrismaUsuarioRepositorio();

  const handler = new ConcluirOnboardingHandler(uow, organizacaoRepo, usuarioRepo);

  try {
    const resultado = await handler.executar(user.id, parsed.data);
    redirect("/dashboard");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao completar onboarding";
    return { success: false, error: message };
  }
}
