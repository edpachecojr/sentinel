import { prisma } from "@/infrastructure/lib/db";
import type { PrismaClient } from "@/generated/prisma/client";
import type { IUsuarioRepositorio, AtualizarUsuarioDto } from "@/core/abstraction/repositories/IUsuarioRepositorio";

export class PrismaUsuarioRepositorio implements IUsuarioRepositorio {
  async atualizar(usuario: AtualizarUsuarioDto, tx?: unknown): Promise<void> {
    const client = (tx as PrismaClient) ?? prisma;

    await client.user.update({
      where: { id: usuario.id },
      data: {
        displayName: usuario.displayName,
        organizacaoId: usuario.organizacaoId,
        onboardingCompleted: usuario.onboardingCompleted,
      },
    });
  }
}
