import { prisma } from "@/infrastructure/lib/db";
import type { IUnitOfWork } from "@/core/abstraction/IUnitOfWork";

export class PrismaUnitOfWork implements IUnitOfWork {
  async executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return (await prisma.$transaction(fn as any)) as T;
  }
}
