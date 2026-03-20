"use server";

import { autenticarUsuarioCommand } from "@/core/casosDeUso/autenticacao/commands/AutenticarUsuarioCommand";
import { AutenticacaoCommandHandler } from "@/core/casosDeUso/autenticacao/handlers/AutenticacaoCommandHandler";

export type EstadoAutenticacao =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function autenticarUsuarioAction(data: unknown): Promise<EstadoAutenticacao> {
  const parsed = autenticarUsuarioCommand.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(errorMap)[0] as keyof typeof errorMap;
    const firstError = firstField ? errorMap[firstField]?.[0] : undefined;
    return { success: false, error: firstError ?? "Dados inválidos" };
  }

  const handler = new AutenticacaoCommandHandler();
  const resultado = await handler.handle({
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  return { success: true, usuarioId: resultado.data.usuarioId };
}
