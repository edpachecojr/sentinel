"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { autenticarUsuarioAction } from "@/app/_actions/auth/autenticarUsuario";
import { logger } from "@/infra/lib/logger";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const resultado = await autenticarUsuarioAction({
          email: formData.email,
          password: formData.password,
        });

        if (!resultado.success) {
          setError(resultado.error);
          logger.error("login:error", { error: resultado.error, email: formData.email });
          return;
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Não foi possível entrar";
        setError(message);
        logger.error("login:error", { error: message, email: formData.email });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && <Alert variant="error" title="Nao foi possivel entrar" message={error} />}

      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="voce@empresa.com"
          defaultValue={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={isPending}
        />
      </div>

      <div>
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Sua senha"
          defaultValue={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>

      <SocialAuthButtons isPending={isPending} />
    </Form>
  );
}

export default LoginForm;
