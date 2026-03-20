"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { container } from "@/container";
import { obterUsuario } from "@/infra/lib/session";

const schema = z.object({
  orgName: z.string().min(1, { message: "Nome da organização é obrigatório" }),
  displayName: z.string().min(1, { message: "Nome de exibição é obrigatório" }),
});

export type EstadoOnboarding =
  | { success: true; organizacaoId: string }
  | { success: false; error: string };

export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const usuario = await obterUsuario();

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const resultado = await container.concluirOnboardingHandler.executar(usuario.id, parsed.data);
    redirect("/dashboard");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao completar onboarding";
    return { success: false, error: message };
  }
}
