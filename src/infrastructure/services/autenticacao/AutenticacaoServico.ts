import { auth } from "@/infrastructure/lib/auth";
import { headers } from "next/headers";
import type { IAutenticacaoServico } from "@/core/abstraction/servicos/IAutenticacaoServico";
import type { RegistrarUsuarioDto } from "../../../core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioResultado";
import type { AutenticarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";
import type { AutenticarUsuarioResultado } from "@/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioResultado";
import { AuthenticationError } from "@/core/abstraction/errors/auth";

export class AutenticacaoServico implements IAutenticacaoServico {
  async registrar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado> {
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

  async autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado> {
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

  async validarSessao(token: string): Promise<boolean> {
    throw new Error("not implemented");
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

  async obterUsuarioPorToken(token: string): Promise<any> {
    throw new Error("not implemented");
  }
}

