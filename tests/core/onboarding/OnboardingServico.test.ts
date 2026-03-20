import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnboardingServico } from "@/core/casosDeUso/onboarding/OnboardingServico";
import type { IUnitOfWork } from "@/core/abstractions/IUnitOfWork";
import type { IOrganizacaoRepositorio } from "@/core/repositorios/IOrganizacaoRepositorio";
import type { IUsuarioRepositorio } from "@/core/repositorios/IUsuarioRepositorio";

describe("OnboardingServico (Core with DI)", () => {
  let mockUow: IUnitOfWork;
  let mockOrgRepo: IOrganizacaoRepositorio;
  let mockUsuarioRepo: IUsuarioRepositorio;
  let servico: OnboardingServico;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUow = {
      executar: vi.fn().mockImplementation((fn: Function) => fn({})),
    };

    mockOrgRepo = {
      criar: vi.fn().mockResolvedValue(undefined),
    };

    mockUsuarioRepo = {
      atualizar: vi.fn().mockResolvedValue(undefined),
    };

    servico = new OnboardingServico(mockUow, mockOrgRepo, mockUsuarioRepo);
  });

  it("should create organization within transaction", async () => {
    const resultado = await servico.concluir("user-123", {
      displayName: "João Silva",
      orgName: "Transportes ABC",
    });

    expect(resultado.organizacaoId).toBeDefined();
    expect(mockUow.executar).toHaveBeenCalledTimes(1);
    expect(mockOrgRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Transportes ABC",
        slug: "transportes-abc",
      }),
      {}
    );
  });

  it("should update user with onboarding completed flag within transaction", async () => {
    const resultado = await servico.concluir("user-456", {
      displayName: "Maria",
      orgName: "Manutenção XYZ",
    });

    expect(mockUsuarioRepo.atualizar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-456",
        displayName: "Maria",
        organizacaoId: resultado.organizacaoId,
        onboardingCompleted: true,
      }),
      {}
    );
  });

  it("should execute organization creation and user update in same transaction", async () => {
    await servico.concluir("user-123", {
      displayName: "João",
      orgName: "Transportes",
    });

    const callArgs = vi.mocked(mockUow.executar).mock.calls[0];
    expect(callArgs).toBeDefined();

    // Both operations should have been passed the same tx (the second param {})
    expect(mockOrgRepo.criar).toHaveBeenCalledWith(expect.any(Object), {});
    expect(mockUsuarioRepo.atualizar).toHaveBeenCalledWith(expect.any(Object), {});
  });

  it("should generate valid slug from organization name", async () => {
    await servico.concluir("user-777", {
      displayName: "Test",
      orgName: "São Paulo - Transportes & Logística",
    });

    expect(mockOrgRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "sao-paulo-transportes-logistica",
      }),
      {}
    );
  });

  it("should return organizacaoId from concluir method", async () => {
    const resultado = await servico.concluir("user-999", {
      displayName: "Test User",
      orgName: "Test Org",
    });

    expect(resultado).toEqual({
      organizacaoId: expect.any(String),
    });
  });
});
