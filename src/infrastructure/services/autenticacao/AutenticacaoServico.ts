import { auth } from "@/infrastructure/lib/auth";
import { headers } from "next/headers";
import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";
import type { RegistrarUsuarioDto } from "../../../core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioResultado";

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

  async autenticar(email: string, senha: string): Promise<string> {
    throw new Error("not implemented");
  }

  async validarSessao(token: string): Promise<boolean> {
    throw new Error("not implemented");
  }

  async invalidarSessao(token: string): Promise<void> {
    throw new Error("not implemented");
  }

  async obterUsuarioPorToken(token: string): Promise<any> {
    throw new Error("not implemented");
  }
}
