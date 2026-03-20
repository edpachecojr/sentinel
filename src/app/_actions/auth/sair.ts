"use server";

import { redirect } from 'next/navigation';
import { container } from '@/container';

export type EstadoSair =
  | { success: true }
  | { success: false; error: string };

export async function sairAction(): Promise<EstadoSair> {
  try {
    await container.sairHandler.executar();
    redirect('/login');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sair';
    return { success: false, error: message };
  }
}
