"use server";

import { z } from 'zod';
import { container } from '@/container';

export type EstadoRegistro =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function registrarUsuarioAction(data: unknown): Promise<EstadoRegistro> {
  const schema = z.object({
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(errorMap)[0] as keyof typeof errorMap;
    const firstError = firstField ? errorMap[firstField]?.[0] : undefined;
    const message = firstError ?? 'Dados inválidos';
    return { success: false, error: message };
  }

  const resultado = await container.registrarUsuarioHandler.executar({
    nome: parsed.data.name,
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  return { success: true, usuarioId: resultado.usuarioId };
}
