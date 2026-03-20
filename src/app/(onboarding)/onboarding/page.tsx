import { redirect } from "next/navigation";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { completeOnboarding } from "@/app/_actions/onboarding/complete";
import { requireAuthOrRedirect } from "@/app/_actions/authAction";

function getInitialDisplayName(name: string | null | undefined, displayName?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (!name?.trim()) {
    return "";
  }

  return name.trim().split(/\s+/)[0] ?? "";
}

export default async function OnboardingPage() {
  const { user } = await requireAuthOrRedirect();

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  const initialDisplayName = getInitialDisplayName(user.name, user.displayName);

  async function handleSubmit(data: { displayName: string; orgName: string }) {
    "use server";
    await completeOnboarding(data);
  }

  return (
    <OnboardingContainer
      initialDisplayName={initialDisplayName}
      onSubmit={handleSubmit}
    />
  );
}
