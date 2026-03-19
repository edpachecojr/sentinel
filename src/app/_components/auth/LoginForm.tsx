"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { authClient } from "@/infrastructure/lib/auth-client";
import { logger } from "@/infrastructure/lib/logger";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      // Use better-auth client to sign in
      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar";
      setError(message);
      logger.error("login:error", { error: message, email: formData.email });
    } finally {
      setIsPending(false);
    }
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
