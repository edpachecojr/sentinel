"use server";

import { redirect } from "next/navigation";
import {
  sessionService,
  UnauthenticatedError,
  InactiveUserError,
} from "@/infrastructure/services/SessionService";
import { logger } from "@/infrastructure/lib/logger";
import type { Session, AuthUser } from "@/infrastructure/services/SessionService";

type ValidSession = {
  session: NonNullable<Session>["session"];
  user: AuthUser;
};

/**
 * Proteção de rotas para Server Components (pages).
 * Chama sessionService.getValidSession(). Em caso de qualquer erro
 * (UnauthenticatedError, InactiveUserError, ou erro inesperado), redireciona
 * o usuário para /login via next/navigation redirect().
 *
 * Uso em page.tsx:
 *   const { user } = await requireAuthOrRedirect();
 */
export async function requireAuthOrRedirect(): Promise<ValidSession> {
  try {
    return await sessionService.getValidSession();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      logger.debug("authAction:requireAuthOrRedirect:unauthenticated");
    } else if (error instanceof InactiveUserError) {
      logger.warn("authAction:requireAuthOrRedirect:inactive-user");
    } else {
      logger.error("authAction:requireAuthOrRedirect:unexpected", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    redirect("/login");
  }
}

/**
 * Verificação de sessão para Server Actions chamadas por Client Components.
 * Retorna { session, user } se autenticado, ou null se não autenticado.
 * Nunca lança — o chamador decide o que fazer com null.
 *
 * Uso em Client Component via Server Action:
 *   const result = await getSessionAction();
 *   if (!result) { // não autenticado }
 */
export async function getSessionAction(): Promise<ValidSession | null> {
  try {
    return await sessionService.getValidSession();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      logger.debug("authAction:getSessionAction:unauthenticated");
    } else if (error instanceof InactiveUserError) {
      logger.warn("authAction:getSessionAction:inactive-user");
    } else {
      logger.error("authAction:getSessionAction:unexpected", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
}
