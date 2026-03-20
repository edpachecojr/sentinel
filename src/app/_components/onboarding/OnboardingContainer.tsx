"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Button from "@/components/ui/button/Button";
import Form from "@/components/form/Form";
import Alert from "@/components/ui/alert/Alert";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { StepDisplayName } from "@/components/onboarding/StepDisplayName";
import { StepOrganization } from "@/components/onboarding/StepOrganization";

type OnboardingContainerProps = {
  initialDisplayName: string;
  onSubmit: (data: { displayName: string; orgName: string }) => Promise<void>;
};

const displayNameSchema = z.string().trim().min(2, "Digite ao menos 2 caracteres").max(100);
const orgNameSchema = z.string().trim().min(2, "Digite ao menos 2 caracteres").max(100);

export function OnboardingContainer({
  initialDisplayName,
  onSubmit,
}: OnboardingContainerProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [orgName, setOrgName] = useState("");

  const displayNameError = useMemo(() => {
    const result = displayNameSchema.safeParse(displayName);
    return result.success ? undefined : result.error.issues[0]?.message;
  }, [displayName]);

  const orgNameError = useMemo(() => {
    const result = orgNameSchema.safeParse(orgName);
    return result.success ? undefined : result.error.issues[0]?.message;
  }, [orgName]);

  const nextStep = () => {
    if (displayNameError) return;
    setCurrentStep(2);
  };

  const previousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    if (orgNameError) return;

    startTransition(async () => {
      try {
        setError(null);
        await onSubmit({ displayName: displayName.trim(), orgName: orgName.trim() });
        router.push("/dashboard");
      } catch {
        setError("Nao foi possivel concluir onboarding. Tente novamente.");
      }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 rounded-3xl border border-white/20 overflow-hidden bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-800/80 backdrop-blur-2xl shadow-2xl dark:border-gray-700/30 p-8 sm:p-12 relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-indigo-900/10 pointer-events-none" />
      
      <div className="relative space-y-8">
        {/* Header section with gradient title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            Vamos configurar sua conta
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Sao apenas {currentStep === 1 ? "dois" : "um"} passo{currentStep === 1 ? "s" : ""} para acessar seu painel.
          </p>
        </div>

      {/* Progress indicator */}
      <ProgressIndicator currentStep={currentStep} />

      {/* Error alert */}
      {error ? (
        <div className="mb-6 animate-in fade-in duration-300">
          <Alert variant="error" title="Erro ao concluir onboarding" message={error} />
        </div>
      ) : null}

      {/* Form */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 1) {
            nextStep();
            return;
          }
          handleSubmit();
        }}
        className="space-y-7"
      >
        {/* Step content with smooth transition */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 min-h-24">
          {currentStep === 1 ? (
            <StepDisplayName
              value={displayName}
              onChange={setDisplayName}
              error={displayName ? displayNameError : undefined}
            />
          ) : (
            <StepOrganization
              value={orgName}
              onChange={setOrgName}
              error={orgName ? orgNameError : undefined}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={isPending || currentStep === 1}
            className="flex-1"
          >
            Voltar
          </Button>

          {currentStep === 1 ? (
            <Button
              type="submit"
              variant="primary"
              disabled={Boolean(displayNameError)}
              loading={isPending}
              className="flex-1"
            >
              Proximo
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={Boolean(orgNameError)}
              loading={isPending}
              className="flex-1"
            >
              Concluir
            </Button>
          )}
        </div>
      </Form>
      </div>
    </div>
  );
}
