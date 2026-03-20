"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { logger } from "@/infrastructure/lib/logger";
import { registroUsuarioCommand } from "@/core/casosDeUso/autenticacao/commands/RegistroUsuarioCommand";
import { registrarUsuarioAction } from "@/app/_actions/auth/registrarUsuario";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import type { z } from "zod";

type RegisterFormValues = z.infer<typeof registroUsuarioCommand>;

function toPortugueseMessage(error: string): string {
  if (error.includes("Email")) return "Email inválido ou já em uso";
  if (error.includes("senha")) return "A senha deve ter pelo menos 8 caracteres";
  if (error.includes("correspondem")) return "As senhas não correspondem";
  if (error.includes("nome")) return "O nome deve ter pelo menos 2 caracteres";
  return error ?? "Não foi possível criar sua conta";
}

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (
    field: keyof RegisterFormValues | "confirmPassword",
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const validation = registroUsuarioCommand.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          errors[path] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        const result = await registrarUsuarioAction(formData);

        if (!result.success) {
          const message = toPortugueseMessage(result.error);
          setError(message);
          logger.error("register:error", { error: result.error });
          return;
        }

        router.push("/onboarding");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar";
        setError(message);
        logger.error("register:error", { error: message });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <Alert variant="error" title="Nao foi possivel criar sua conta" message={error} />
      )}

      <div>
        <Label htmlFor="register-name">Nome</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          disabled={isPending}
          error={!!fieldErrors.name}
          hint={fieldErrors.name}
        />
      </div>

      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="voce@empresa.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={isPending}
          error={!!fieldErrors.email}
          hint={fieldErrors.email}
        />
      </div>

      <div>
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="No minimo 8 caracteres"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          disabled={isPending}
          error={!!fieldErrors.password}
          hint={fieldErrors.password}
        />
      </div>

      <div>
        <Label htmlFor="register-confirm-password">Confirmar senha</Label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="Repita sua senha"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          disabled={isPending}
          error={!!fieldErrors.confirmPassword}
          hint={fieldErrors.confirmPassword}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>

      <SocialAuthButtons isPending={isPending} />
    </Form>
  );
}

export default RegisterForm;
