import { auth } from "@/infra/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export class UnauthenticatedError extends Error {
  constructor(message = "Usuário não autenticado") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class InactiveUserError extends Error {
  constructor(message = "Usuário inativo") {
    super(message);
    this.name = "InactiveUserError";
  }
}

export type Session = Awaited<ReturnType<typeof auth.api.getSession>> | null;

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  onboardingCompleted?: boolean;
  organizacaoId?: string;
}

class SessionServiceImpl {
  async getSession(): Promise<Session> {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session;
  }

  async getValidSession(): Promise<{ session: NonNullable<Session>["session"]; user: AuthUser }> {
    const session = await this.getSession();
    if (!session?.user || !session?.session) {
      throw new UnauthenticatedError();
    }
    return {
      session: session.session,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        displayName: session.user.name,
        onboardingCompleted: session.user.onboardingCompleted as boolean | undefined,
        organizacaoId: session.user.organizacaoId as string | undefined,
      },
    };
  }

  async requireUser(): Promise<AuthUser> {
    const session = await this.getValidSession();
    if (!session?.user) {
      throw new UnauthenticatedError();
    }
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      displayName: session.user.name,
      onboardingCompleted: session.user.onboardingCompleted as boolean | undefined,
      organizacaoId: session.user.organizacaoId as string | undefined,
    };
  }

  async obterOrganizacao(): Promise<{ nome: string; id: string } | null> {
    try {
      const user = await this.requireUser();
      if (!user.organizacaoId) {
        return null;
      }

      // Aqui você buscaria a organização do banco
      // Por enquanto, retorna um placeholder
      return {
        id: user.organizacaoId,
        nome: "Org",
      };
    } catch {
      return null;
    }
  }
}

export const sessionService = new SessionServiceImpl();
