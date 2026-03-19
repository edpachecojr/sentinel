"use server";

import { sessionService } from "@/infrastructure/services/SessionService";
import { completeUserOnboardingService } from "@/infrastructure/services/users/completeOnboarding";

export async function completeUserOnboarding(data: unknown) {
  const user = await sessionService.requireUser();

  return completeUserOnboardingService(user.id, data);
}
