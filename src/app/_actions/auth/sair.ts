"use server";

import { redirect } from 'next/navigation';
import { container } from '@/container';

export type EstadoSair = { success: false; error: string };

export async function sairAction(): Promise<EstadoSair> {
  try {
    await container.sairHandler.executar();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao encerrar sessão';
    return { success: false, error: message };
  }
  redirect('/login');
}
