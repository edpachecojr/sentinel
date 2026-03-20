"use server";

import { redirect } from "next/navigation";
import { sessionService } from "@/infrastructure/services/SessionService";
import { completeOnboardingService } from "@/infrastructure/services/onboarding/complete";

export async function completeOnboarding(data: {
  displayName: string;
  orgName: string;
}) {
  const user = await sessionService.requireUser();

  await completeOnboardingService({
    userId: user.id,
    displayName: data.displayName,
    orgName: data.orgName,
  });

  redirect("/dashboard");
}
