import { headers } from "next/headers";

import { auth } from "@/infra/lib/auth";
import type {
  IAutenticacaoServico,
  RegistrarUsuarioParams,
  RegistrarUsuarioResultado,
  AutenticarUsuarioParams,
  AutenticarUsuarioResultado,
  SessaoAutenticada,
  UsuarioAutenticado,
  OrganizacaoData,
} from "@/core/abstraction/servicos/IAutenticacaoServico";
import { AuthenticationError, UnauthenticatedError } from "@/core/abstraction/errors/auth";
import type { IOrganizacaoRepositorio } from "@/core/abstraction/repositories/IOrganizacaoRepositorio";

export class AutenticacaoServico implements IAutenticacaoServico {
  constructor(private readonly organizacaoRepository: IOrganizacaoRepositorio) {}

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

  async obterSessao(): Promise<SessaoAutenticada | null> {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user || !session?.session) {
      return null;
    }

    return {
      sessao: session.session,
      usuario: {
        id: session.user.id,
        email: session.user.email,
        nome: session.user.name,
        displayName: session.user.name,
        onboardingCompleted: session.user.onboardingCompleted as boolean | undefined,
        organizacaoId: session.user.organizacaoId as string | undefined,
      },
    };
  }

  async obterUsuario(): Promise<UsuarioAutenticado> {
    const sessao = await this.obterSessao();

    if (!sessao?.usuario) {
      throw new UnauthenticatedError();
    }

    return {
      id: sessao.usuario.id,
      email: sessao.usuario.email,
      nome: sessao.usuario.nome,
      displayName: sessao.usuario.displayName,
      onboardingCompleted: sessao.usuario.onboardingCompleted,
      organizacaoId: sessao.usuario.organizacaoId,
    };
  }

  async obterOrganizacao(): Promise<OrganizacaoData | null> {
    try {
      const usuario = await this.obterUsuario();

      if (!usuario.organizacaoId) {
        return null;
      }

      return await this.organizacaoRepository.buscarPorId(usuario.organizacaoId);
    } catch {
      return null;
    }
  }
}

