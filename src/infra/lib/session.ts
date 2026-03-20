/**
 * Session Utilities — Funções stateless para leitura de sessão
 *
 * Estas não são singletons, são apenas utilitários que encapsulam
 * a lógica de ler e validar sessão sem violar a arquitetura de camadas.
 *
 * Uso:
 * - Pages (Server Components): await obterSessao()
 * - Actions: await obterUsuario() para validação
 */

import type { UsuarioAutenticado, SessaoAutenticada, OrganizacaoData } from "@/core/abstraction/servicos/IAutenticacaoServico";
import { AutenticacaoServico } from "@/infra/services/autenticacao/AutenticacaoServico";
import { PrismaOrganizacaoRepositorio } from "@/infra/repositories/PrismaOrganizacaoRepositorio";

/**
 * Cria uma instância do serviço de autenticação com dependências
 * Encapsula a instanciação para manter DI e estabilidade arquitetural
 */
function criarAutenticacaoServico(): AutenticacaoServico {
  const organizacaoRepository = new PrismaOrganizacaoRepositorio();
  return new AutenticacaoServico(organizacaoRepository);
}

/**
 * Obtém a sessão do usuário autenticado
 * Delega para AutenticacaoServico para centralizar lógica de better-auth
 * Retorna null se não autenticado
 */
export async function obterSessao(): Promise<SessaoAutenticada | null> {
  const servico = criarAutenticacaoServico();
  return servico.obterSessao();
}

/**
 * Obtém o usuário autenticado ou lança UnauthenticatedError
 * Delega para AutenticacaoServico
 */
export async function obterUsuario(): Promise<UsuarioAutenticado> {
  const servico = criarAutenticacaoServico();
  return servico.obterUsuario();
}

/**
 * Obtém a organização do usuário autenticado
 * Delega para AutenticacaoServico, que encapsula acesso ao banco
 * Retorna null se não autenticado ou sem organizacaoId
 */
export async function obterOrganizacao(): Promise<OrganizacaoData | null> {
  const servico = criarAutenticacaoServico();
  return servico.obterOrganizacao();
}
