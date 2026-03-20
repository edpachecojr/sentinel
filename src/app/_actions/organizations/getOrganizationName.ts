"use server";

import { obterOrganizacao } from "@/infra/lib/session";

export async function getOrganizationName(): Promise<string | null> {
  const organizacao = await obterOrganizacao();
  return organizacao?.nome ?? null;
}
