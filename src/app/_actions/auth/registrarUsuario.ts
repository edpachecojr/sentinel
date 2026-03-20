"use server";

import { registroUsuarioCommand } from "@/core/casosDeUso/autenticacao/commands/RegistroUsuarioCommand";
import { RegistroUsuarioCommandHandler } from "@/core/casosDeUso/autenticacao/handlers/RegistroUsuarioCommandHandler";

export type EstadoRegistro =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function registrarUsuarioAction(data: unknown): Promise<EstadoRegistro> {
  const parsed = registroUsuarioCommand.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(errorMap)[0] as keyof typeof errorMap;
    const firstError = firstField ? errorMap[firstField]?.[0] : undefined;
    const message = firstError ?? "Dados inválidos";
    return { success: false, error: message };
  }

  const handler = new RegistroUsuarioCommandHandler();
  const resultado = await handler.handle({
    nome: parsed.data.name,
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  return { success: true, usuarioId: resultado.data.usuarioId };
}
