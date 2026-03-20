import { redirect } from "next/navigation";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { completeOnboarding } from "@/app/_actions/onboarding/concluirOnboarding";
import { requireAuthOrRedirect } from "@/app/_lib/auth";

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
  const { usuario } = await requireAuthOrRedirect();

  if (usuario.onboardingCompleted) {
    redirect("/dashboard");
  }

  const initialDisplayName = getInitialDisplayName(usuario.nome, usuario.displayName);

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
