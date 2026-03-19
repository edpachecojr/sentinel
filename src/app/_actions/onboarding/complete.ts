"use server";

import { sessionService } from "@/infrastructure/services/SessionService";
import { completeOnboardingService } from "@/infrastructure/services/onboarding/complete";

export async function completeOnboarding(data: {
  displayName: string;
  orgName: string;
}) {
  const user = await sessionService.requireUser();

  return completeOnboardingService({
    userId: user.id,
    displayName: data.displayName,
    orgName: data.orgName,
  });
}
