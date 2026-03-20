# Layer Patterns — Sentinel

Referência rápida de snippets por camada. Copie e adapte — nunca invente padrões novos.

> Leia este arquivo quando for implementar um arquivo de uma camada específica e quiser confirmar o padrão correto.

---

## Table of Contents

- [Action Layer](#action-layer)
- [Use Case / Service Layer (Core)](#use-case--service-layer-core)
- [Repository Layer (Infrastructure)](#repository-layer-infrastructure)
- [Interfaces do Core](#interfaces-do-core)
- [Zod Schemas](#zod-schemas)
- [Testes](#testes)
- [Injeção de Dependência (Composition Root)](#injeção-de-dependência-composition-root)

---

## Action Layer

`src/app/_actions/<dominio>/nomeDaAction.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { sessionService } from "@/infrastructure/lib/session";
import { NomeUseCase } from "@/core/casosDeUso/<dominio>/NomeUseCase";
import { NomeRepository } from "@/infrastructure/repositories/NomeRepository";

export async function nomeDaAction(data: unknown) {
  // 1. Sessão SEMPRE primeiro — nunca pule esta linha
  const { organizacaoId, userId } = await sessionService.requireOrgSession();

  // 2. Injeção de dependência (composition root)
  const repository = new NomeRepository();
  const useCase = new NomeUseCase(repository);

  // 3. Executar
  const resultado = await useCase.executar(data, organizacaoId);

  // 4. Revalidar cache
  revalidatePath("/<rota>");

  return { success: true, data: resultado };
}
```

**Regras:**
- Zero lógica de negócio — apenas orquestração
- `requireOrgSession()` é a primeira instrução sem exceção
- Um `revalidatePath()` por rota afetada pela mutação
- Erros NÃO são capturados aqui — deixe propagar para o cliente

---

## Use Case / Service Layer (Core)

`src/core/casosDeUso/<dominio>/NomeUseCase.ts`

```typescript
import { nomeSchema } from "@/app/_schemas/<dominio>/nomeSchema";
import { generateId } from "@/utils/uuid";
import { logger } from "@/infrastructure/lib/logger";
import type { INomeRepository } from "@/core/abstraction/repositories/INomeRepository";

export class NomeUseCase {
  constructor(private readonly repository: INomeRepository) {}

  async executar(data: unknown, organizacaoId: string) {
    // 1. Guard: organizacaoId é obrigatório
    if (!organizacaoId) throw new Error("ID da organização é obrigatório");

    // 2. Validação com Zod — lança ZodError em caso de falha
    const validado = nomeSchema.parse(data);

    // 3. Regras de negócio aqui (cálculos, validações de domínio)

    // 4. Persistir via interface — nunca via Prisma diretamente
    const resultado = await this.repository.criar({
      id: generateId(),
      ...validado,
      organizacaoId,
    });

    // 5. Log estruturado
    logger.info("entidade:criada", { id: resultado.id, organizacaoId });

    return resultado;
  }
}
```

**Regras:**
- Recebe `organizacaoId` como parâmetro — NUNCA lê session
- Depende apenas de interfaces (`INomeRepository`), nunca de classes concretas
- Zod valida na borda — dados internos são tipo-seguros
- Erros em português

---

## Repository Layer (Infrastructure)

`src/infrastructure/repositories/NomeRepository.ts`

```typescript
import { prisma } from "@/infrastructure/lib/db";
import type { INomeRepository } from "@/core/abstraction/repositories/INomeRepository";
import type { CriarNomeDto } from "@/core/casosDeUso/<dominio>/dtos/CriarNomeDto";

export class NomeRepository implements INomeRepository {
  async criar(data: CriarNomeDto) {
    return prisma.nomeModelo.create({ data });
  }

  async listar(organizacaoId: string) {
    return prisma.nomeModelo.findMany({
      where: {
        organizacaoId,     // ← SEMPRE
        deletadoEm: null,  // ← SEMPRE (soft delete filter)
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(id: string, organizacaoId: string) {
    return prisma.nomeModelo.findFirst({
      where: { id, organizacaoId, deletadoEm: null },
    });
  }

  async atualizar(id: string, data: Partial<CriarNomeDto>) {
    return prisma.nomeModelo.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    // Soft delete — NUNCA use prisma.model.delete()
    return prisma.nomeModelo.update({
      where: { id },
      data: { deletadoEm: new Date() },
    });
  }
}
```

**Regras:**
- Implementa interface do Core (`implements INomeRepository`)
- Toda query inclui `organizacaoId` + `deletadoEm: null`
- Zero lógica de negócio — apenas queries Prisma
- Instanciado com `new` a cada chamada — nunca singleton

---

## Interfaces do Core

`src/core/abstraction/repositories/INomeRepository.ts`

```typescript
import type { CriarNomeDto } from "@/core/casosDeUso/<dominio>/dtos/CriarNomeDto";
import type { NomeEntidade } from "@/core/entidades/nome";

export interface INomeRepository {
  criar(data: CriarNomeDto): Promise<NomeEntidade>;
  listar(organizacaoId: string): Promise<NomeEntidade[]>;
  buscarPorId(id: string, organizacaoId: string): Promise<NomeEntidade | null>;
  atualizar(id: string, data: Partial<CriarNomeDto>): Promise<NomeEntidade>;
  deletar(id: string): Promise<NomeEntidade>;
}
```

`src/core/entidades/nome.ts`

```typescript
// Interfaces puras — sem runtime code, sem classes
export interface NomeEntidade {
  id: string;
  organizacaoId: string;
  // ...campos do domínio em português
  criadoEm: Date;
  deletadoEm: Date | null;
}
```

---

## Zod Schemas

`src/app/_schemas/<dominio>/nomeSchema.ts`

```typescript
import { z } from "zod";

export const criarNomeSchema = z.object({
  campo: z.string().min(1, { message: "Campo é obrigatório" }),
  valor: z.number().positive({ message: "Valor deve ser positivo" }),
  // Enums Prisma:
  tipo: z.enum(["OPCAO_A", "OPCAO_B"], { message: "Tipo inválido" }),
});

export type CriarNomeDto = z.infer<typeof criarNomeSchema> & {
  id: string;
  organizacaoId: string;
};

export const atualizarNomeSchema = criarNomeSchema.partial();
export type AtualizarNomeDto = z.infer<typeof atualizarNomeSchema>;
```

---

## Testes

`tests/<camada>/<dominio>/NomeUseCase.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AUTH_TEST_UUIDS } from "../../mocks/auth";
import { NomeUseCase } from "@/core/casosDeUso/<dominio>/NomeUseCase";
import type { INomeRepository } from "@/core/abstraction/repositories/INomeRepository";

const mockEntidade = {
  id: "id-mockado",
  organizacaoId: AUTH_TEST_UUIDS.ORG_ID,
  campo: "valor",
  criadoEm: new Date(),
  deletadoEm: null,
};

describe("NomeUseCase", () => {
  let mockRepository: INomeRepository;
  let useCase: NomeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = {
      criar: vi.fn().mockResolvedValue(mockEntidade),
      listar: vi.fn().mockResolvedValue([mockEntidade]),
      buscarPorId: vi.fn().mockResolvedValue(mockEntidade),
      atualizar: vi.fn().mockResolvedValue(mockEntidade),
      deletar: vi.fn().mockResolvedValue(mockEntidade),
    };
    useCase = new NomeUseCase(mockRepository);
  });

  it("deve lançar erro quando organizacaoId está vazio", async () => {
    await expect(
      useCase.executar({ campo: "teste", valor: 10 }, "")
    ).rejects.toThrow("obrigatório");
  });

  it("deve criar entidade com dados válidos", async () => {
    const resultado = await useCase.executar(
      { campo: "teste", valor: 10 },
      AUTH_TEST_UUIDS.ORG_ID
    );

    expect(resultado).toEqual(mockEntidade);
    expect(mockRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        organizacaoId: AUTH_TEST_UUIDS.ORG_ID,
        campo: "teste",
      })
    );
  });

  it("deve rejeitar input inválido com erro de validação", async () => {
    await expect(
      useCase.executar({ valor: -1 }, AUTH_TEST_UUIDS.ORG_ID)
    ).rejects.toThrow(); // ZodError
  });
});
```

**Teste de Repository (com Prisma mockado):**

```typescript
import { prisma } from "@/infrastructure/lib/db";
import { NomeRepository } from "@/infrastructure/repositories/NomeRepository";
import { AUTH_TEST_UUIDS } from "../../mocks/auth";

// prisma já está mockado globalmente em tests/setup.ts

describe("NomeRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deve filtrar por organizacaoId e deletadoEm: null ao listar", async () => {
    vi.mocked(prisma.nomeModelo.findMany).mockResolvedValue([]);

    const repo = new NomeRepository();
    await repo.listar(AUTH_TEST_UUIDS.ORG_ID);

    expect(prisma.nomeModelo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizacaoId: AUTH_TEST_UUIDS.ORG_ID,
          deletadoEm: null,
        },
      })
    );
  });
});
```

---

## Injeção de Dependência (Composition Root)

A composição ocorre **sempre na Action Layer**. O Core nunca instancia infraestrutura.

```typescript
// Na Action — composition root manual
const repository = new NomeRepository();          // Infrastructure
const useCase = new NomeUseCase(repository);      // Core recebe infra via interface

const resultado = await useCase.executar(data, organizacaoId);
```

Para transações envolvendo múltiplos repositórios, use `IUnitOfWork`:

```typescript
import { PrismaUnitOfWork } from "@/infrastructure/unitOfWork/PrismaUnitOfWork";

const uow = new PrismaUnitOfWork();
const repoA = new RepositorioA();
const repoB = new RepositorioB();
const useCase = new UseCaseComTransacao(uow, repoA, repoB);
```

O Unit of Work garante atomicidade sem o Core conhecer Prisma:

```typescript
// Core/UseCase
await this.uow.executar(async (tx) => {
  await this.repoA.criar(dadosA, tx);
  await this.repoB.atualizar(id, dadosB, tx);
});
```
