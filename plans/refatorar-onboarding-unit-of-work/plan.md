# Refatorar Onboarding com Unit of Work + Repositórios

**Branch:** `refactor/onboarding-unit-of-work`
**Description:** Refatora o fluxo de onboarding eliminando o acesso direto ao Prisma no serviço de infraestrutura, movendo a lógica de orquestração para o Core via Unit of Work e injeção de dependência.

## Goal

O `OnboardingServico` atual viola a arquitetura ao operar em `src/infrastructure/services/` mas conter lógica de negócio e acesso direto ao `prisma.$transaction`. O `ConcluirOnboardingCommandHandler` viola a regra Core → Infrastructure ao instanciar `OnboardingServico` diretamente. O objetivo é introduzir os contratos `IOrganizacaoRepositorio`, `IUsuarioRepositorio` e `IUnitOfWork` no Core, mover a orchestração para o Core, e deixar o Infrastructure com apenas implementações concretas Prisma.

## Diagrama de Dependências Alvo

```
Action (composition root)
  → instancia PrismaUnitOfWork, PrismaOrganizacaoRepositorio, PrismaUsuarioRepositorio
  → instancia OnboardingServico(uow, orgRepo, usuarioRepo)  [Core]
  → instancia ConcluirOnboardingUseCase(onboardingServico)  [Core]
  → instancia ConcluirOnboardingCommandHandler(useCase)     [Core]
  → handler.handle(userId, dto)

Core define:
  IUnitOfWork           ← src/core/abstractions/IUnitOfWork.ts
  IOrganizacaoRepositorio  ← src/core/repositorios/IOrganizacaoRepositorio.ts
  IUsuarioRepositorio      ← src/core/repositorios/IUsuarioRepositorio.ts
  OnboardingServico        ← src/core/casosDeUso/onboarding/OnboardingServico.ts (NOVO)

Infrastructure implementa:
  PrismaUnitOfWork             ← src/infrastructure/services/onboarding/PrismaUnitOfWork.ts
  PrismaOrganizacaoRepositorio ← src/infrastructure/repositories/PrismaOrganizacaoRepositorio.ts
  PrismaUsuarioRepositorio     ← src/infrastructure/repositories/PrismaUsuarioRepositorio.ts
```

---

## Implementation Steps

### Step 1: Criar abstrações Core — IUnitOfWork e interfaces de repositório

**Files:**
- `src/core/abstractions/IUnitOfWork.ts` (CRIAR)
- `src/core/repositorios/IOrganizacaoRepositorio.ts` (CRIAR)
- `src/core/repositorios/IUsuarioRepositorio.ts` (CRIAR)
- `src/utils/slug.ts` (CRIAR — extrair `generateSlug` do OnboardingServico atual)

**What:**
Criar os contratos que o Core define e que Infrastructure deve implementar. `IUnitOfWork` expõe `executar<T>(fn)` como abstração de transação agnóstica ao banco. `IOrganizacaoRepositorio` aceita `tx?: unknown` para participar da transação. `IUsuarioRepositorio` idem. `generateSlug` extraída para `src/utils/slug.ts` para ser testável isoladamente.

```typescript
// src/core/abstractions/IUnitOfWork.ts
export interface IUnitOfWork {
  executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}

// src/core/repositorios/IOrganizacaoRepositorio.ts
import type { Organizacao } from "@/core/models/Organizacao";

export interface IOrganizacaoRepositorio {
  criar(organizacao: Organizacao, tx?: unknown): Promise<void>;
}

// src/core/repositorios/IUsuarioRepositorio.ts
export type AtualizarUsuarioDto = {
  id: string;
  displayName: string;
  organizacaoId: string;
  onboardingCompleted: boolean;
};

export interface IUsuarioRepositorio {
  atualizar(usuario: AtualizarUsuarioDto, tx?: unknown): Promise<void>;
}
```

**Testing:** Arquivos de contrato TypeScript — validação via `pnpm build` sem erros de compilação.

---

### Step 2: Mover OnboardingServico para o Core com injeção de dependência

**Files:**
- `src/core/casosDeUso/onboarding/OnboardingServico.ts` (CRIAR — lógica de orquestração aqui)
- `src/infrastructure/services/onboarding/OnboardingServico.ts` (DELETAR)

**What:**
O `OnboardingServico` sai de Infrastructure e vai para o Core. Passa a receber `IUnitOfWork`, `IOrganizacaoRepositorio` e `IUsuarioRepositorio` no construtor. `generateId()` continua sendo chamado no Core (é agnóstico ao banco). `generateSlug` importada de `@/utils/slug`. A interface `IOnboardingServico` existente permanece sem alterações.

```typescript
// src/core/casosDeUso/onboarding/OnboardingServico.ts
import { generateId } from "@/utils/uuid";
import { generateSlug } from "@/utils/slug";
import type { IOnboardingServico } from "./IOnboardingServico";
import type { IUnitOfWork } from "@/core/abstractions/IUnitOfWork";
import type { IOrganizacaoRepositorio } from "@/core/repositorios/IOrganizacaoRepositorio";
import type { IUsuarioRepositorio } from "@/core/repositorios/IUsuarioRepositorio";
import type { ConcluirOnboardingDto } from "./dtos/ConcluirOnboardingDto";
import type { ConcluirOnboardingResultado } from "./dtos/ConcluirOnboardingResultado";

export class OnboardingServico implements IOnboardingServico {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepositorio,
    private readonly usuarioRepo: IUsuarioRepositorio
  ) {}

  async concluir(userId: string, dto: ConcluirOnboardingDto): Promise<ConcluirOnboardingResultado> {
    const organizacaoId = generateId();

    await this.uow.executar(async (tx) => {
      await this.organizacaoRepo.criar(
        { id: organizacaoId, nome: dto.orgName, slug: generateSlug(dto.orgName) },
        tx
      );
      await this.usuarioRepo.atualizar(
        { id: userId, displayName: dto.displayName, organizacaoId, onboardingCompleted: true },
        tx
      );
    });

    return { organizacaoId };
  }
}
```

**Testing:** `pnpm build` sem erros de tipo. O UseCase existente (`ConcluirOnboarding.ts`) continua funcionando pois `IOnboardingServico` não mudou.

---

### Step 3: Implementar PrismaUnitOfWork e repositórios Prisma em Infrastructure

**Files:**
- `src/infrastructure/services/onboarding/PrismaUnitOfWork.ts` (CRIAR)
- `src/infrastructure/repositories/PrismaOrganizacaoRepositorio.ts` (CRIAR)
- `src/infrastructure/repositories/PrismaUsuarioRepositorio.ts` (CRIAR)
- `src/infrastructure/repositories/OrganizationRepository.ts` (DELETAR — substituído)
- `src/infrastructure/repositories/UserRepository.ts` (DELETAR — substituído)
- `src/types/organization.ts` (DELETAR `CreateOrganizationData` — tipo substituído por `Organizacao` do Core)

**What:**
Implementações concretas Prisma que satisfazem os contratos do Core. `PrismaUnitOfWork.executar` usa `prisma.$transaction`. Os repositórios recebem `tx?: unknown` e fazem cast para `PrismaClient` quando presente, caso contrário usam a instância global.

```typescript
// PrismaUnitOfWork
import { prisma } from "@/infrastructure/lib/db";
import type { IUnitOfWork } from "@/core/abstractions/IUnitOfWork";

export class PrismaUnitOfWork implements IUnitOfWork {
  async executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn as Parameters<typeof prisma.$transaction>[0]);
  }
}

// PrismaOrganizacaoRepositorio
import { prisma } from "@/infrastructure/lib/db";
import type { PrismaClient } from "@/generated/prisma/client";
import type { IOrganizacaoRepositorio } from "@/core/repositorios/IOrganizacaoRepositorio";
import type { Organizacao } from "@/core/models/Organizacao";

export class PrismaOrganizacaoRepositorio implements IOrganizacaoRepositorio {
  async criar(organizacao: Organizacao, tx?: unknown): Promise<void> {
    const client = (tx as PrismaClient) ?? prisma;
    await client.organizacao.create({
      data: { id: organizacao.id, nome: organizacao.nome, slug: organizacao.slug },
    });
  }
}

// PrismaUsuarioRepositorio
import { prisma } from "@/infrastructure/lib/db";
import type { PrismaClient } from "@/generated/prisma/client";
import type { IUsuarioRepositorio, AtualizarUsuarioDto } from "@/core/repositorios/IUsuarioRepositorio";

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
```

**Testing:** `pnpm build` sem erros. Verificar que nada mais importa `OrganizationRepository` ou `UserRepository` antes de deletar (grep confirma).

---

### Step 4: Corrigir Handler e montar composition root na Action

**Files:**
- `src/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler.ts` (ATUALIZAR — receber UseCase via construtor)
- `src/app/_actions/onboarding/concluirOnboarding.ts` (ATUALIZAR — composition root completo)

**What:**
`ConcluirOnboardingCommandHandler` passa a receber `ConcluirOnboardingUseCase` no construtor, eliminando a violação de importar Infrastructure. A Action torna-se o composition root: instancia toda a cadeia de dependências e orquestra a chamada.

```typescript
// ConcluirOnboardingCommandHandler — CORRIGIDO
export class ConcluirOnboardingCommandHandler {
  constructor(private readonly useCase: ConcluirOnboardingUseCase) {}

  async handle(userId: string, dto: ConcluirOnboardingCommand): Promise<RespostaOnboarding<ConcluirOnboardingResultado>> {
    try {
      const resultado = await this.useCase.executar(userId, dto);
      return { success: true, data: resultado };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao concluir onboarding.";
      return { success: false, error: message };
    }
  }
}

// concluirOnboarding.ts — Action como composition root
export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const user = await sessionService.requireUser();

  const parsed = concluirOnboardingCommand.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  // Composition root
  const uow = new PrismaUnitOfWork();
  const organizacaoRepo = new PrismaOrganizacaoRepositorio();
  const usuarioRepo = new PrismaUsuarioRepositorio();
  const onboardingServico = new OnboardingServico(uow, organizacaoRepo, usuarioRepo);
  const useCase = new ConcluirOnboardingUseCase(onboardingServico);
  const handler = new ConcluirOnboardingCommandHandler(useCase);

  const resultado = await handler.handle(user.id, parsed.data);

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/dashboard");
}
```

**Testing:** Fluxo de onboarding completo testável manualmente. `pnpm build` sem erros.

---

### Step 5: Adaptar testes

**Files:**
- `tests/services/onboarding/OnboardingServico.test.ts` (ATUALIZAR — mockar IUnitOfWork, IOrganizacaoRepositorio, IUsuarioRepositorio)
- `tests/application/handlers/ConcluirOnboardingCommandHandler.test.ts` (ATUALIZAR — Handler recebe UseCase via construtor)
- `tests/core/onboarding/ConcluirOnboardingUseCase.test.ts` (VERIFICAR — IOnboardingServico não mudou, deve passar)

**What:**
Adaptar testes para o novo padrão de injeção de dependência. O `OnboardingServico` agora fica em `src/core/`, então o teste importa do Core. Mocks das interfaces são objetos simples com `vi.fn()`. O `ConcluirOnboardingCommandHandler` agora recebe o `useCase` via construtor no teste.

```typescript
// tests/services/onboarding/OnboardingServico.test.ts (adaptado)
import { OnboardingServico } from "@/core/casosDeUso/onboarding/OnboardingServico";

describe("OnboardingServico", () => {
  const mockUow = { executar: vi.fn() };
  const mockOrgRepo = { criar: vi.fn() };
  const mockUsuarioRepo = { atualizar: vi.fn() };
  let servico: OnboardingServico;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUow.executar.mockImplementation((fn) => fn({})); // executa o callback inline
    servico = new OnboardingServico(mockUow, mockOrgRepo, mockUsuarioRepo);
  });

  it("cria organização e atualiza usuário na mesma transação", async () => {
    const resultado = await servico.concluir("user-id", { displayName: "João", orgName: "Transportes XYZ" });

    expect(mockOrgRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Transportes XYZ" }),
      {}
    );
    expect(mockUsuarioRepo.atualizar).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-id", displayName: "João", onboardingCompleted: true }),
      {}
    );
    expect(resultado.organizacaoId).toBeDefined();
  });
});
```

**Testing:** `pnpm vitest run` — todos os testes passam.

---

### Step 6: Atualizar AGENTS.md

**Files:**
- `AGENTS.md` (ATUALIZAR)

**What:**
- Adicionar seção documentando o padrão Unit of Work com exemplo de código
- Atualizar seção §3 (Architecture) para mencionar `IUnitOfWork` e o padrão de transação via abstração
- Atualizar seção §6 (Key Patterns) com exemplo de uso do UoW
- Remover referências obsoletas a `@/lib/` (substituído por `@/infrastructure/lib/`) nas seções de debugging
- Atualizar §14.3 (Core Layer) para documentar que a lógica de orquestração fica no Core com DI
- Remover o padrão de instanciar infra dentro do Core (violação documentada como anti-pattern)

**Testing:** Revisão manual do documento — consistência com o código implementado.
