/**
 * Container de Injeção de Dependência
 *
 * Este arquivo é o único ponto de composição centralizado onde:
 * 1. Todos os repositórios, serviços e handlers são instanciados
 * 2. As dependências são injetadas nos handlers
 * 3. As Server Actions importam os handlers prontos do container
 *
 * Regra de ouro: As Server Actions NUNCA instanciam dependências —
 * elas sempre usam os handlers do container.
 */

import { PrismaOrganizacaoRepositorio } from "@/infra/repositories/PrismaOrganizacaoRepositorio";
import { PrismaUsuarioRepositorio } from "@/infra/repositories/PrismaUsuarioRepositorio";
import { PrismaUnitOfWork } from "@/infra/unitOfWork/PrismaUnitOfWork";
import { AutenticacaoServico } from "@/infra/services/autenticacao/AutenticacaoServico";

import { AutenticarUsuarioHandler } from "@/core/casosDeUso/autenticacao/autenticarUsuarioHandler";
import { RegistrarUsuarioHandler } from "@/core/casosDeUso/autenticacao/registrarUsuarioHandler";
import { SairHandler } from "@/core/casosDeUso/autenticacao/sairHandler";
import { ConcluirOnboardingHandler } from "@/core/casosDeUso/onboarding/concluirOnboardingHandler";

// ========== INFRAESTRUTURA ==========
// Instancia uma vez — compartilhada por todos os handlers
const autenticacaoServico = new AutenticacaoServico();
const organizacaoRepo = new PrismaOrganizacaoRepositorio();
const usuarioRepo = new PrismaUsuarioRepositorio();
const prismaUow = new PrismaUnitOfWork();

// ========== HANDLERS COM INJEÇÃO DE DEPENDÊNCIA ==========
export const container = {
  // === Autenticação ===
  autenticarUsuarioHandler: new AutenticarUsuarioHandler(autenticacaoServico),
  registrarUsuarioHandler: new RegistrarUsuarioHandler(autenticacaoServico),
  sairHandler: new SairHandler(autenticacaoServico),

  // === Onboarding ===
  concluirOnboardingHandler: new ConcluirOnboardingHandler(
    prismaUow,
    organizacaoRepo,
    usuarioRepo,
  ),
};
