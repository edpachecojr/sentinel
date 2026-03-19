"use server";

import { sessionService } from "@/infrastructure/services/SessionService";

export async function getOrganizationName(): Promise<string | null> {
  const organizacao = await sessionService.obterOrganizacao();
  return organizacao?.nome ?? null;
}
