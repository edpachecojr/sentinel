"use server";

import { z } from 'zod';
import { container } from '@/container';

export type EstadoAutenticacao =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function autenticarUsuarioAction(data: unknown): Promise<EstadoAutenticacao> {
  const schema = z.object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(errorMap)[0] as keyof typeof errorMap;
    const firstError = firstField ? errorMap[firstField]?.[0] : undefined;
    return { success: false, error: firstError ?? 'Dados inválidos' };
  }

  const resultado = await container.autenticarUsuarioHandler.executar({
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  return { success: true, usuarioId: resultado.usuarioId };
}
