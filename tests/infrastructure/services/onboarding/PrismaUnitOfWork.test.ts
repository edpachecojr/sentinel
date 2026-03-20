import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/infra/db/prismaClient";
import { PrismaUnitOfWork } from "@/infra/unitOfWork/PrismaUnitOfWork";
import { PrismaOrganizacaoRepositorio } from "@/infra/repositories/PrismaOrganizacaoRepositorio";
import { PrismaUsuarioRepositorio } from "@/infra/repositories/PrismaUsuarioRepositorio";
import type { Organizacao } from "@/core/entidades/organizacao";

describe("PrismaUnitOfWork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute callback with prisma transaction", async () => {
    const uow = new PrismaUnitOfWork();
    const fn = vi.fn().mockResolvedValue("result");

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback(prisma);
    });

    const result = await uow.executar(fn);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(prisma);
    expect(result).toBe("result");
  });
});

describe("PrismaOrganizacaoRepositorio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create organization using prisma client", async () => {
    const repo = new PrismaOrganizacaoRepositorio();
    const org: Organizacao = { id: "org-123", nome: "Test Org", slug: "test-org" };

    await repo.criar(org);

    expect(prisma.organizacao.create).toHaveBeenCalledWith({
      data: {
        id: "org-123",
        nome: "Test Org",
        slug: "test-org",
      },
    });
  });

  it("should create organization using tx if provided", async () => {
    const repo = new PrismaOrganizacaoRepositorio();
    const org: Organizacao = { id: "org-456", nome: "Org 2", slug: "org-2" };
    const mockTx = { organizacao: { create: vi.fn().mockResolvedValue({}) } };

    await repo.criar(org, mockTx);

    expect(mockTx.organizacao.create).toHaveBeenCalledWith({
      data: {
        id: "org-456",
        nome: "Org 2",
        slug: "org-2",
      },
    });
  });
});

describe("PrismaUsuarioRepositorio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update user using prisma client", async () => {
    const repo = new PrismaUsuarioRepositorio();

    await repo.atualizar({
      id: "user-123",
      displayName: "João",
      organizacaoId: "org-123",
      onboardingCompleted: true,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        displayName: "João",
        organizacaoId: "org-123",
        onboardingCompleted: true,
      },
    });
  });

  it("should update user using tx if provided", async () => {
    const repo = new PrismaUsuarioRepositorio();
    const mockTx = { user: { update: vi.fn().mockResolvedValue({}) } };

    await repo.atualizar(
      {
        id: "user-456",
        displayName: "Maria",
        organizacaoId: "org-456",
        onboardingCompleted: true,
      },
      mockTx
    );

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "user-456" },
      data: {
        displayName: "Maria",
        organizacaoId: "org-456",
        onboardingCompleted: true,
      },
    });
  });
});
