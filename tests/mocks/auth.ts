export const AUTH_TEST_UUIDS = {
  USER_ID: "550e8400-e29b-41d4-a716-446655440001",
  ORG_ID: "550e8400-e29b-41d4-a716-446655440002",
  SESSION_ID: "550e8400-e29b-41d4-a716-446655440003",
} as const;

export function buildAuthenticatedSession(orgId?: string) {
  return {
    user: {
      id: AUTH_TEST_UUIDS.USER_ID,
      email: "test@example.com",
      organizacaoId: orgId ?? AUTH_TEST_UUIDS.ORG_ID,
    },
    session: {
      id: AUTH_TEST_UUIDS.SESSION_ID,
      userId: AUTH_TEST_UUIDS.USER_ID,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  };
}

import type { SessaoAutenticada, UsuarioAutenticado } from "@/core/abstraction/servicos/IAutenticacaoServico";

export function buildUsuarioAutenticado(overrides?: Partial<UsuarioAutenticado>): UsuarioAutenticado {
  return {
    id: AUTH_TEST_UUIDS.USER_ID,
    email: "test@example.com",
    nome: "Test User",
    displayName: "Test",
    onboardingCompleted: true,
    organizacaoId: AUTH_TEST_UUIDS.ORG_ID,
    ...overrides,
  };
}

export function buildSessaoAutenticada(overrides?: Partial<SessaoAutenticada>): SessaoAutenticada {
  return {
    sessao: { id: AUTH_TEST_UUIDS.SESSION_ID },
    usuario: buildUsuarioAutenticado(),
    ...overrides,
  };
}
