"use server";

import { sessionService } from "@/infrastructure/services/SessionService";
import { createOrganizationService } from "@/infrastructure/services/organizations/create";

export async function createOrganization(data: unknown) {
  await sessionService.requireUser();

  return createOrganizationService(data);
}
