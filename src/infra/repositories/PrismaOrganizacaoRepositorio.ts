import { prisma } from "@/infra/db/prismaClient";
import type { PrismaClient } from "@/generated/prisma/client";
import type { IOrganizacaoRepositorio } from "@/core/abstraction/repositories/IOrganizacaoRepositorio";
import type { Organizacao } from "@/core/entidades/organizacao";

export class PrismaOrganizacaoRepositorio implements IOrganizacaoRepositorio {
  async criar(organizacao: Organizacao, tx?: unknown): Promise<void> {
    const client = (tx as PrismaClient) ?? prisma;

    await client.organizacao.create({
      data: {
        id: organizacao.id,
        nome: organizacao.nome,
        slug: organizacao.slug,
      },
    });
  }

  async buscarPorId(id: string): Promise<{ id: string; nome: string } | null> {
    const organizacao = await prisma.organizacao.findFirst({
      where: { id, deletadoEm: null },
      select: { id: true, nome: true },
    });
    return organizacao;
  }
}
