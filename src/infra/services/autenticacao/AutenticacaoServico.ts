import { auth } from "@/infra/lib/auth";
import { headers } from "next/headers";
import type { IAutenticacaoServico, RegistrarUsuarioParams, RegistrarUsuarioResultado, AutenticarUsuarioParams, AutenticarUsuarioResultado } from "@/core/abstraction/servicos/IAutenticacaoServico";
import { AuthenticationError } from "@/core/abstraction/errors/auth";

export class AutenticacaoServico implements IAutenticacaoServico {
  async registrar(data: RegistrarUsuarioParams): Promise<RegistrarUsuarioResultado> {
    const resultado = await auth.api.signUpEmail({
      body: {
        name: data.nome,
        email: data.email,
        password: data.senha,
      },
      headers: await headers(),
    });

    if (!resultado?.user) {
      throw new Error("Falha ao registrar usuário.");
    }

    return { usuarioId: resultado.user.id };
  }

  async autenticar(dto: AutenticarUsuarioParams): Promise<AutenticarUsuarioResultado> {
    const response = await auth.api.signInEmail({
      body: {
        email: dto.email,
        password: dto.senha,
      },
      headers: await headers(),
      asResponse: true,
    });

    if (!response.ok) {
      throw new Error("Email ou senha incorretos.");
    }

    const payload = await response.json();

    if (!payload?.user?.id) {
      throw new Error("Falha ao autenticar usuário.");
    }

    return { usuarioId: payload.user.id };
  }

  async sair(): Promise<void> {
    const response = await auth.api.signOut({
      headers: await headers(),
      asResponse: true,
    });

    if (!response.ok) {
      throw new AuthenticationError("Falha ao encerrar sessão.");
    }
  }
}

