/**
 * Session Utilities — Funções stateless para leitura de sessão
 *
 * Estas não são singletons, são apenas utilitários que encapsulam
 * a lógica de ler e validar sessão sem violar a arquitetura de camadas.
 *
 * Uso:
 * - Pages (Server Components): await obterSessao()
 * - Actions: await obterUsuario() para validação
 */

import { auth } from "@/infra/lib/auth";
import { headers } from "next/headers";
import { UnauthenticatedError } from "@/core/abstraction/errors/auth";
import type { UsuarioAutenticado, SessaoAutenticada } from "@/core/abstraction/servicos/IAutenticacaoServico";
import { prisma } from "@/infra/db/prismaClient";

/**
 * Lê a sessão bruta do auth.api.getSession
 * Retorna null se não autenticado
 */
export async function obterSessao(): Promise<SessaoAutenticada | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user || !session?.session) {
    return null;
  }

  return {
    sessao: session.session,
    usuario: {
      id: session.user.id,
      email: session.user.email,
      nome: session.user.name,
      displayName: session.user.name,
      onboardingCompleted: session.user.onboardingCompleted as boolean | undefined,
      organizacaoId: session.user.organizacaoId as string | undefined,
    },
  };
}

/**
 * Obtém o usuário autenticado ou lança UnauthenticatedError
 * Usa obterSessao internamente
 */
export async function obterUsuario(): Promise<UsuarioAutenticado> {
  const sessao = await obterSessao();

  if (!sessao?.usuario) {
    throw new UnauthenticatedError();
  }

  return {
    id: sessao.usuario.id,
    email: sessao.usuario.email,
    nome: sessao.usuario.nome,
    displayName: sessao.usuario.displayName,
    onboardingCompleted: sessao.usuario.onboardingCompleted,
    organizacaoId: sessao.usuario.organizacaoId,
  };
}

/**
 * Obtém a organização do usuário autenticado
 * Retorna null se não autenticado ou sem organizacaoId
 */
export async function obterOrganizacao(): Promise<{ id: string; nome: string } | null> {
  try {
    const usuario = await obterUsuario();

    if (!usuario.organizacaoId) {
      return null;
    }

    return await prisma.organizacao.findFirst({
      where: { id: usuario.organizacaoId, deletadoEm: null },
      select: { id: true, nome: true },
    });
  } catch {
    return null;
  }
}
