"use server";

import { redirect } from 'next/navigation';
import { AutenticacaoServico } from '@/infrastructure/services/autenticacao/AutenticacaoServico';
import { SairHandler } from '@/core/casosDeUso/autenticacao/sairHandler';

export type EstadoSair =
  | { success: true }
  | { success: false; error: string };

export async function sairAction(): Promise<EstadoSair> {
  const autenticacaoServico = new AutenticacaoServico();
  const handler = new SairHandler(autenticacaoServico);

  await handler.executar();
  redirect('/login');
}
