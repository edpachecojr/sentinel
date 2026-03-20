/**
 * Auth utilities para Pages (Server Components)
 * 
 * Estas funções encapsulam lógica de sessão específica para pages,
 * sem violar a arquitetura de camadas.
 */

import { redirect } from "next/navigation";
import { obterSessao } from "@/infra/lib/session";
import { logger } from "@/infra/lib/logger";
import { UnauthenticatedError, InactiveUserError } from "@/core/abstraction/errors/auth";
import type { SessaoAutenticada, UsuarioAutenticado } from "@/core/abstraction/servicos/IAutenticacaoServico";

export type ValidSession = {
  sessao: SessaoAutenticada["sessao"];
  usuario: UsuarioAutenticado;
};

/**
 * Proteção de rotas para Server Components (pages).
 * Chama obterSessao(). Em caso de qualquer erro, redireciona para /login.
 *
 * Uso em page.tsx:
 *   const { usuario } = await requireAuthOrRedirect();
 */
export async function requireAuthOrRedirect(): Promise<ValidSession> {
  try {
    const sessao = await obterSessao();
    if (!sessao) {
      throw new UnauthenticatedError();
    }
    return {
      sessao: sessao.sessao,
      usuario: sessao.usuario,
    };
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      logger.debug("app:requireAuthOrRedirect:unauthenticated");
    } else if (error instanceof InactiveUserError) {
      logger.warn("app:requireAuthOrRedirect:inactive-user");
    } else {
      logger.error("app:requireAuthOrRedirect:unexpected", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    redirect("/login");
  }
}
