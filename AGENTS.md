# AGENTS.md — Agentic Development Guidelines for Falcon

Welcome, agent. This document outlines the technical standards, architectural patterns, and development workflows for the `Falcon` project. Adhere strictly to these guidelines.

---

## 1. Project Context

`Falcon` is a SaaS platform for autonomous truck drivers and small fleet owners to manage their business operations. It centralizes freight logging, ANTT legal fare calculation, vehicle maintenance, fuel control, and financial dashboards. Designed for individual truck drivers operating solo or managing small fleets (1–20 vehicles).

- **Runtime**: Node.js (Vercel / Edge Functions)
- **Language**: TypeScript 5+ (Strict)
- **Framework**: Next.js 16+ (App Router, Server Components)
- **Database**: PostgreSQL (Neon managed) via Prisma v7
- **Auth**: better-auth v1.5 (Email/Password + OAuth: Google, GitHub)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Package Manager**: pnpm (workspace-aware)
- **Locale**: UI and error messages in **Portuguese (pt-BR)**; code in **English**

---

## 2. Core Commands

### 2.1 Development
```bash
pnpm dev            # Start Next.js dev server (localhost:3000)
pnpm build          # Build Next.js for production
pnpm start          # Start production server
```

### 2.2 Code Quality
```bash
pnpm lint           # Run ESLint (Next.js core-web-vitals config)
pnpm prettier --write .   # Format code (no format script — run directly)
```

### 2.3 Testing (Vitest)
```bash
pnpm vitest run                          # Run all tests (single pass)
pnpm vitest run tests/lib/session.test.ts  # Run a specific test file
pnpm vitest run -t "should return null"  # Run tests matching a name
pnpm vitest                              # Watch mode (interactive TDD)
```

### 2.4 Database (Prisma)
```bash
pnpm prisma generate             # Regenerate Prisma client (after schema changes)
pnpm prisma migrate dev          # Create and apply a new migration
pnpm prisma migrate reset        # Reset and re-apply all migrations (dev only)
pnpm prisma db push              # Push schema without migration file (prototyping only)
pnpm prisma studio               # Open Prisma Studio GUI
```

> **Note**: The Prisma client is generated to `generated/prisma/` (not the default `node_modules/.prisma`). Always run `pnpm prisma generate` after modifying `prisma/schema.prisma`.

---

## 3. Architecture & Layer Rules

Falcon uses a strict 4-layer architecture. Respect import boundaries — violations cause coupling and security issues.

```
UI Layer (Components + Pages)
        │
        ▼
Action Layer  ← src/actions/**   "use server" — entry point for mutations
        │
        ▼
Service Layer ← src/services/**  — business logic, validation, orchestration
        │
        ▼
Repository Layer ← src/repositories/**  — database access only
        │
        ▼
Lib / Infrastructure ← src/lib/**  — auth, db, session, logger
```

### 3.1 Lib Layer (`src/lib/`)
- **Contains**: `auth.ts`, `auth-client.ts`, `db.ts`, `session.ts`, `logger.ts`, `utils.ts`
- **Responsibility**: Infrastructure singletons and utilities
- **Constraint**: No imports from services, actions, or components

### 3.2 Repository Layer (`src/repositories/`)
- **Contains**: `VehicleRepository.ts`, `FreteRepository.ts`, `FuelRecordRepository.ts`, `MaintenanceRepository.ts`, `GeneralExpenseRepository.ts`, `UserRepository.ts`, `OrganizationRepository.ts`
- **Responsibility**: Database queries only. Instantiated as classes, not singletons.
- **Constraint**: Only imports from `@/lib/db` (Prisma). Zero business logic.
- **Requirement**: All queries **must** filter by `organizationId` and `deletedAt: null`

### 3.3 Service Layer (`src/services/`)
- **Contains**: Domain-grouped files (e.g., `fretes/create.ts`, `veiculos/create.ts`, `antt/calcularFrete.ts`)
- **Responsibility**: Business logic, Zod validation, orchestration
- **Constraint**: Never access session/request directly. Receives `organizationId` (and, when applicable, `userId`) as explicit parameters.
- **Requirement**: Throw meaningful Portuguese error messages. Must be testable in isolation.

### 3.4 Action Layer (`src/actions/`)
- **Contains**: Server Actions grouped by domain (e.g., `fretes/create.ts`, `veiculos/create.ts`, `abastecimentos/create.ts`)
- **Responsibility**: Session enforcement, calling services, cache invalidation
- **Constraint**: Must always call `sessionService.requireOrgSession()` first for protected routes. No business logic. Calls `revalidatePath()` after mutations.

> **Nota de arquitetura:** a camada `application` (command handlers em um nível separado) não é utilizada neste estágio do projeto. O fluxo recomendado foi ajustado para:
> `Actions (src/actions) → Core/CasosDeUso (src/core/casosDeUso) → Infrastructure (src/infrastructure/services/repos)`

### 3.5 UI Layer (`src/components/`, `src/app/`)
- **Server Components**: Fetch data directly, call server actions via props.
- **Client Components**: Use `"use client"` directive. Use `authClient` hooks (never server session functions). Use `useSession()` from `@/lib/auth-client`.
- **Constraint**: Never import services or repositories directly.

### Import Dependency Table

| Layer | Can import | Must NOT import |
|---|---|---|
| `lib/` | Nothing internal | Services, Actions, Components |
| `repositories/` | `lib/db` | Services, Actions, Components |
| `services/` | `lib/`, `repositories/`, `types/`, `utils/` | Actions, Components |
| `actions/` | `services/`, `lib/session`, `next/cache` | Components |
| `components/` | `lib/auth-client`, other components, types | Services, Repositories |

---

## 4. Multi-Tenancy Rules

Every business entity in Falcon is scoped to an `Organizacao`. This is the core security boundary.

- **All** database queries on business models (`Veiculo`, `Frete`, `RegistroAbastecimento`, `RegistroManutencao`, `DespesaGeral`) **must** include `organizacaoId` in the `where` clause.
- The `organizacaoId` is sourced from `sessionService.requireOrgSession()` in the Action layer and passed down explicitly.
- **Never** trust `organizacaoId` from client-supplied input; always read it from the server session.
- Soft deletes are used on business models (except `RegistroAbastecimento`): set `deletadoEm: new Date()` instead of `.delete()`. Always filter `deletadoEm: null` in read queries.

```typescript
// ✅ Correto — organizacaoId vem da sessão, nunca do input do cliente
const { organizacaoId } = await sessionService.requireOrgSession();
return freteRepository.listar(organizacaoId);

// ❌ Errado — nunca confie em IDs enviados pelo cliente
const { orgId } = formData; // NUNCA faça isso
```

---

## 5. Code Style Standards

### 5.1 TypeScript
- `strict: true` is enforced in `tsconfig.json` — no exceptions.
- Avoid `any`. Use TypeScript interfaces for models, union types for enums equivalents.
- Export inferred Zod types: `export type LoginFormValues = z.infer<typeof loginSchema>;`
- Path aliases: `@/*` → `src/*`, `@/generated/*` → `generated/*`
- **Nunca utilize re-exports.** Imports devem sempre apontar diretamente para o arquivo de origem. Arquivos intermediários que apenas re-exportam símbolos de outro módulo são proibidos.

**TypeScript Strict Mode Notes:**
- Use `NonNullable<T>` para remover `null | undefined` quando necessário
- Nunca use `as any` ou `// @ts-ignore` — refatore o código em vez disso
- Discriminated unions são preferíveis a tipos opcionais difusos:
  ```typescript
  // ✅ Bom — discriminado, type-safe
  type Result = { success: true; data: T } | { success: false; error: string };
  
  // ❌ Ruim — impreciso, permite estados inválidos
  type Result = { success?: boolean; data?: T; error?: string };
  ```
- Use `unknown` para entrada não validada, after validation use tipos concretos
- Interfaces genéricas devem ter constraints claros: `<T extends Record<string, unknown>>`

### 5.2 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files (logic) | `camelCase.ts` | `criarFrete.ts` |
| Files (components) | `PascalCase.tsx` | `LoginForm.tsx` |
| Classes | `PascalCase` | `FreteRepository`, `SessionService` |
| Functions | `camelCase` | `criarFreteService`, `loginAction` |
| Types / Interfaces | `PascalCase` | `CriarFreteData`, `AppSession` |
| Constants | `SCREAMING_SNAKE_CASE` | `AUTH_TEST_UUIDS` |
| Zod schemas | `camelCase` suffix `Schema` | `loginSchema`, `criarFreteSchema` |

- **Nomeação em Português (pt-BR)**: sempre que criar novos arquivos, componentes, classes ou símbolos, use nomes em português brasileiro.
- **Refatoração ao tocar em arquivos em inglês**: ao alterar um arquivo, classe ou componente cujo nome esteja em inglês, refatore o nome para português brasileiro.

### 5.3 Import Order & Re-exports Policy

**Always import from the source**, never from intermediary files:

```typescript
// ❌ ERRADO — importar de arquivo que apenas re-exporta
import { FreteService } from "@/services/fretes";

// ✅ CORRETO — importar diretamente da origem
import { FreteService } from "@/services/fretes/FreteService";
```

**Import Sequence (must follow this order):**
1. External libraries (`react`, `next/`, `better-auth`, `zod`, etc.)
2. Internal infrastructure (`@/infrastructure/lib/`)
3. Internal repositories (`@/infrastructure/repositories/`)
4. Internal services (`@/infrastructure/services/`)
5. Internal core (`@/services/`, `@/types/`, `@/schemas/`)
6. Internal utils (`@/utils/`)
7. Relative imports (`./`, `../`)

**Why No Re-exports:**
- Clarity: Readers see exactly where symbols come from
- Refactoring: Moving imports becomes obvious
- Tooling: Language servers track direct sources better
- Mistakes: Circular dependencies caught earlier
- Index files: Only for barrel exports of related types (use sparingly)

### 5.4 Error Messages
- All user-facing errors must be in **Portuguese**
- Throw `Error("Nao autorizado")` for auth failures
- Throw `Error("Organization ID e obrigatorio")` for missing org

### 5.5 Logging
Always use the structured logger from `@/lib/logger`. Never use raw `console.log` in production code.

```typescript
import { logger } from "@/lib/logger";

logger.info("frete:criado", { freteId: frete.id, organizacaoId });
logger.error("frete:criar:erro", { error: err.message, organizacaoId });
```

### 5.6 Infrastructure Consolidation (`@/infrastructure/*`)

The `/infrastructure` folder consolidates all technical dependencies and adapters:

```
src/infrastructure/
  lib/                          ← Singletons: auth, db, session, logger
    auth.ts                     ← better-auth server config
    auth-client.ts              ← better-auth client hooks
    db.ts                       ← Prisma instance
    session.ts                  ← Session management
    logger.ts                   ← Structured logging
    
  services/                     ← Concrete implementations
    autenticacao/
      AutenticacaoServico.ts    ← Implements IAutenticacaoServico
      dtos/
        RegistroDTO.ts
    
  repositories/                 ← Database access
    UserRepository.ts           ← Implements IUserRepository
    FreteRepository.ts          ← Implements IFreteRepository
```

**Rules for `/infrastructure`:**
- Services here **implement** interfaces defined in Core (`src/services/`)
- Only files in Services layer directly use these implementations
- Actions and Components never import from here directly
- Mocks in tests must match the interface contract, not implementation details

---

## 6. Key Patterns (Copy These Exactly)

### 6.1 Server Action Pattern
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { sessionService } from "@/lib/session";
import { criarFreteService } from "@/services/fretes/create";

export async function criarFrete(data: unknown) {
  const { organizacaoId } = await sessionService.requireOrgSession(); // Sempre primeiro
  const frete = await criarFreteService(data, organizacaoId);
  revalidatePath("/fretes");
  return { success: true, frete };
}
```

### 6.2 Service Layer Pattern
```typescript
import { FreteRepository } from "@/repositories/FreteRepository";
import { criarFreteSchema } from "@/schemas/frete";
import { generateId } from "@/utils/uuid";

export async function criarFreteService(data: unknown, organizacaoId: string) {
  if (!organizacaoId) throw new Error("Organization ID é obrigatório");

  const validated = criarFreteSchema.parse(data); // Zod lança exceção em falha
  const repository = new FreteRepository();        // Instanciado, não singleton

  return repository.criar({
    id: generateId(),
    ...validated,
    organizacaoId,
  });
}
```

### 6.3 Repository Pattern
```typescript
import { prisma } from "@/lib/db";

export class FreteRepository {
  async listar(organizacaoId: string) {
    return prisma.frete.findMany({
      where: { organizacaoId, deletadoEm: null }, // Ambos os filtros sempre obrigatórios
      orderBy: { data: "desc" },
    });
  }

  async deletar(id: string) {
    return prisma.frete.update({        // Soft delete — nunca hard delete
      where: { id },
      data: { deletadoEm: new Date() },
    });
  }
}
```

### 6.4 Zod Schema Pattern
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email invalido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

### 6.5 Client Component Pattern
```typescript
"use client";

import { authClient } from "@/lib/auth-client"; // Client auth — never server auth
import { logger } from "@/lib/logger";

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await authClient.signIn.email({ email, password });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel entrar";
      setError(message);
      logger.error("login:error", { error: message });
    } finally {
      setIsPending(false);
    }
  };
}

### 6.6 Form Page Pattern (UI)

For pages that render a form (e.g., freight creation/edit, maintenance registration, fuel record), follow a consistent layout:

- Wrap the entire form in a `ComponentCard` (or the equivalent page card component).
- Use a clear, semantic hierarchy of sections using `<section>` and descriptive headings/subtitles.
- Keep the form fields grouped into logical blocks (dates, vehicle selection, values, notes, etc.), using responsive grids for layout.
- Show error banners at the top of the card and inline field hints for validation.
- Keep the submit action in a footer-aligned button row.

This ensures a cohesive, predictable experience across all form pages, matching the style of `FreteForm` and `RegistrarManutencaoForm`.
```

---

## 7. Database Schema Reference

> **Convenção**: todos os campos do schema seguem **português (pt-BR)**. Os modelos do better-auth (`user`, `session`, `account`, `verification`) mantêm nomes em inglês por exigência da biblioteca.

### Modelos de Negócio

| Model | Campos Principais | Notas |
|---|---|---|
| `User` | `id`, `email`, `organizacaoId`, `onboardingCompleted`, `displayName` | Estendido pelo better-auth |
| `Organizacao` | `id`, `nome`, `slug`, `plano`, `criadoEm`, `deletadoEm` | Tenant raiz (motorista/transportadora) |
| `Veiculo` | `id`, `placa`, `modelo`, `marca`, `ano`, `capacidadeCargaKg`, `tipo`, `organizacaoId`, `deletadoEm` | Soft-deletable; placa única por org |
| `Frete` | `id`, `veiculoId`, `origem`, `destino`, `distanciaKm`, `pesoCargaKg`, `tipoCarga`, `valor`, `valorMinimoAntt`, `data`, `observacoes`, `organizacaoId`, `deletadoEm` | `valorMinimoAntt` armazenado para auditoria |
| `RegistroAbastecimento` | `id`, `veiculoId`, `data`, `litros`, `valor`, `precoPorLitro`, `local`, `organizacaoId` | **Sem** `deletadoEm` — registro imutável |
| `RegistroManutencao` | `id`, `veiculoId`, `tipo`, `data`, `valor`, `oficina`, `descricao`, `dataProximaManutencao`, `organizacaoId`, `deletadoEm` | Alertas preventivos |
| `DespesaGeral` | `id`, `descricao`, `categoria`, `valor`, `data`, `recorrente`, `veiculoId?`, `organizacaoId`, `deletadoEm` | Despesas operacionais gerais |

### Enums
```prisma
enum PlanoOrganizacao { GRATUITO  PREMIUM  EMPRESARIAL }
enum TipoVeiculo     { BAU  TANQUE  GRADE_BAIXA  REFRIGERADO  OUTRO }
enum TipoManutencao  { TROCA_OLEO  PNEU  FREIOS  FILTRO  SUSPENSAO  ELETRICA  OUTRO }
enum CategoriaDespesa { IMPOSTOS  TELEFONE  ALUGUEL  SEGURO  OUTRO }
```

### Geração de ID
Sempre use `generateId()` de `@/utils/uuid` (wrapper do `uuid v4`). Nunca use `Math.random()` ou IDs sequenciais.

---

## 8. Testing Standards

### 8.1 Framework & Setup
- **Framework**: Vitest (globals enabled — no imports needed for `describe`, `it`, `expect`)
- **Environment**: `node` (not `jsdom` by default)
- **Setup file**: `tests/setup.ts` (mocks `next/navigation`, Prisma, and `server-only`)
- **Aliases**: Same path aliases as source (`@/*`, `@/generated/*`, `server-only` mocked)

### 8.2 What to Test
- ✅ Services (business logic, validation)
- ✅ Repositories (query behavior with mocked Prisma)
- ✅ Lib utilities (`logger`, `session`, `utils`)
- ✅ Zod schemas and custom validators (e.g., placa format, ANTT calculation)
- ⚠️ Actions (test session enforcement and service delegation)
- ⚠️ Components (only complex interaction logic)

### 8.3 Mocks

**Use mock builders from `tests/mocks/`:**
```typescript
import { AUTH_TEST_UUIDS, buildAuthenticatedSession } from "@/tests/mocks/auth";

// Consistent test UUIDs
AUTH_TEST_UUIDS.USER_ID   // "550e8400-e29b-41d4-a716-446655440001"
AUTH_TEST_UUIDS.ORG_ID    // "550e8400-e29b-41d4-a716-446655440002"
AUTH_TEST_UUIDS.SESSION_ID // "550e8400-e29b-41d4-a716-446655440003"

buildAuthenticatedSession(orgId?) // Returns a valid session object
```

**Mock Prisma** (already configured globally in `tests/setup.ts`):
```typescript
import { prisma } from "@/lib/db";
vi.mocked(prisma.frete.findMany).mockResolvedValue([]);
```

**Correct Mock Paths After Infrastructure Consolidation:**
```typescript
// ✅ Mocking infrastructure implementations
vi.mock("@/infrastructure/services/autenticacao/AutenticacaoServico");
vi.mock("@/infrastructure/repositories/FreteRepository");

// ✅ Mocking core interfaces (not implementations)
vi.mock("@/core/auth/IAutenticacaoServico");

// ✅ Mocking lib utilities
vi.mock("@/infrastructure/lib/auth");
vi.mock("@/infrastructure/lib/session");
```

**Pattern: Testing Each Layer Independently**

```typescript
// Layer 1: Core (Services) — test business logic WITHOUT infrastructure
describe("RegistrarUsuarioUseCase", () => {
  it("should validate and transform input", async () => {
    const mockRepository: IAutenticacaoServico = {
      registrar: vi.fn().mockResolvedValue({ usuarioId: "123" }),
    };
    
    const useCase = new RegistrarUsuarioUseCase(mockRepository);
    const result = await useCase.executar(validData);
    
    expect(result).toEqual({ usuarioId: "123" });
    expect(mockRepository.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" })
    );
  });
});

// Layer 2: Infrastructure (Repositories) — test with mocked Prisma
describe("FreteRepository", () => {
  it("should query with org filter", async () => {
    vi.mocked(prisma.frete.findMany).mockResolvedValue([mockFrete]);
    
    const repo = new FreteRepository();
    const result = await repo.listar(AUTH_TEST_UUIDS.ORG_ID);
    
    expect(prisma.frete.findMany).toHaveBeenCalledWith({
      where: { organizacaoId: AUTH_TEST_UUIDS.ORG_ID, deletadoEm: null },
    });
  });
});

// Layer 3: Actions — test session enforcement and delegation
describe("criarFreteAction", () => {
  it("should enforce session before delegating", async () => {
    vi.mocked(sessionService.requireOrgSession).mockRejectedValue(
      new Error("Unauthorized")
    );
    
    await expect(criarFreteAction(formData))
      .rejects.toThrow("Unauthorized");
  });
});
```

### 8.4 Test Structure Template
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("criarFreteService()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when organizationId is missing", async () => {
    await expect(criarFreteService(validData, "")).rejects.toThrow(
      "Organization ID e obrigatorio",
    );
  });

  it("creates frete with validated data", async () => {
    vi.mocked(prisma.frete.create).mockResolvedValue(mockFrete);
    const result = await criarFreteService(validData, AUTH_TEST_UUIDS.ORG_ID);
    expect(result).toEqual(mockFrete);
  });
});
```

---

## 9. Environment Variables & Path Aliases

### 9.1 Environment Variables

A `.env.local` file (not committed) must be configured for local development. Create it from `.env.example`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon or local) |
| `BETTER_AUTH_SECRET` | ✅ | Min 32-char random secret |
| `BETTER_AUTH_URL` | ✅ | App base URL (`http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL (same as above in dev) |
| `GITHUB_CLIENT_ID` | OAuth | GitHub OAuth app credentials |
| `GITHUB_CLIENT_SECRET` | OAuth | |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth app credentials |
| `GOOGLE_CLIENT_SECRET` | OAuth | |
| `MAILTRAP_HOST` | Email | SMTP host (`sandbox.smtp.mailtrap.io`) |
| `MAILTRAP_PORT` | Email | SMTP port (`587` or `2525`) |
| `MAILTRAP_USER` | Email | SMTP username |
| `MAILTRAP_PASS` | Email | SMTP password |
| `MAILTRAP_FROM` | Email | Sender address |
| `PRISMA_LOG_QUERIES` | Optional | Set to `1` to log SQL queries |

### 9.2 Path Aliases Configuration

The `tsconfig.json` defines path aliases for clean imports across the entire project:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/generated/*": ["generated/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/core/*": ["src/core/*"],
      "@/application/*": ["src/application/*"]
    }
  }
}
```

**Critical Rules:**
- `baseUrl` MUST be set for path aliases to work
- Always use aliases for internal imports (no relative paths like `../../` between layers)
- Aliases make refactoring safer and code more readable
- Tests use the same aliases as source code via `vitest.config.ts`

**Common Path Alias Usage:**
```typescript
// ✅ External and infrastructure
import { prisma } from "@/infrastructure/lib/db";
import { sessionService } from "@/infrastructure/services/SessionService";

// ✅ Core and application
import { IFreteRepository } from "@/core/repositories/IFreteRepository";
import { RegistroUsuarioCommandHandler } from "@/application/handlers/RegistroUsuarioCommandHandler";

// ✅ Generated code
import { User, Frete } from "@/generated/prisma/client";
```

---

## 10. Security Rules

- **Never** trust `organizationId` from client-side input. Always source it from `sessionService.requireOrgSession()`.
- **Never** store plain-text passwords. better-auth handles hashing internally.
- **Never** expose Prisma or database errors directly to the client. Catch and rethrow with safe messages.
- **Never** read session inside Service layer — pass `organizationId` and `userId` as parameters.
- **Always** validate external input with Zod at the service boundary.
- **Always** use soft delete (`deletedAt`) to preserve audit trails.

---

## 11. Git Conventions

Commit style: `type(scope): description`

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `test` | Adding or fixing tests |
| `docs` | Documentation updates |
| `chore` | Tooling, config, dependencies |

**Examples:**
```
feat(fretes): add create frete form with ANTT calculation
fix(session): throw correct error when organization missing
test(services): add coverage for criarFreteService edge cases
docs(agents): update AGENTS.md with testing patterns
```

Branch naming: `feat/short-description`, `fix/issue-slug`

---

## 12. What NOT to Do

- ❌ Don't add REST API routes for data that can be handled by Server Actions
- ❌ Don't use `any` type — be explicit or use `unknown` with runtime validation
- ❌ Don't add hardcoded organization IDs or user IDs in code
- ❌ Don't create repository singletons — instantiate with `new Repository()` per service call
- ❌ Don't import `@/lib/session` in client components — use `authClient.useSession()` instead
- ❌ Don't bypass `requireOrgSession()` in server actions — even internal ones
- ❌ Don't use `prisma.frete.delete()` — always soft-delete via `deletedAt`
- ❌ Don't commit `.env.local` — it is git-ignored

---

## 13. Desenvolvimento de Novas Features

### 13.1 Antes de codar
- Entenda o problema: leia a issue/brief, comentários e critérios de aceitação.
- Verifique se já há um plano em `plans/<nome-da-feature>/plan.md` e, se não, crie um usando a estrutura existente.
- Use o arquivo `plans/<nome-da-feature>/PROGRESS.txt` para documentar o status e impedimentos durante o desenvolvimento.
- Confirme o escopo com o time antes de começar (se aplicável).

### 13.2 Como construir
- Siga a arquitetura de 4 camadas (UI → Actions → Services → Repositories). Não quebre dependências entre camadas.
- Valide todo input com Zod nos Services. Não confie em dados do cliente.
- Sempre obtenha `organizationId` via `sessionService.requireOrgSession()` nas Actions para manter a segurança multi-tenancy.
- Use Server Actions para mutações e revalide rotas com `revalidatePath()` após alterar dados.
- Escreva testes antes de implementar (TDD) sempre que possível:
  - Serviços: unidade com validação e fluxo de negócios
  - Repositórios: mock do Prisma para garantir consultas corretas
  - Componentes: apenas quando houver lógica complexa de interação

**TDD Workflow: RED-GREEN-REFACTOR**

Para cada funcionalidade, aplique este ciclo rigorosamente:

1. **RED** — Escreva um teste que falha
   ```typescript
   it("should throw error when organizationId is missing", async () => {
     await expect(criarFreteService({}, "")).rejects.toThrow("Organization ID é obrigatório");
   });
   // ❌ Teste falha — não há implementação ainda
   ```

2. **GREEN** — Escreva código mínimo para passar
   ```typescript
   export async function criarFreteService(data: unknown, organizacaoId: string) {
     if (!organizacaoId) throw new Error("Organization ID é obrigatório");
     // Implementação mínima — apenas o suficiente para passar
   }
   ```

3. **REFACTOR** — Melhore sem quebrar testes
   ```typescript
   // Extraia validação para Zod, melhore estrutura, mantenha testes verdes
   const validated = criarFreteSchema.parse(data);
   // ... refatora conforme necessário
   ```

**Nunca pule etapas.** RED-GREEN-REFACTOR garante cobertura, design emergente e confiança.

### 13.3 Qualidade e revisão
- Execute `pnpm lint`, `pnpm prettier --write .` e `pnpm vitest run` antes de abrir o PR.
- Garanta que mensagens de erro exibidas no UI estejam em **Português (pt-BR)** e sejam claras para o usuário.
- Faça o PR com título claro e descrição que explique o quê, por que e como. Inclua checklist de testes feitos.
- Use convenção de branch: `feat/`, `fix/`, `refactor/`, etc.
- Ao revisar, valide:
  - Consistência com o plano e critérios de aceitação
  - Cobertura de testes relevante
  - Não quebra de contratos (por exemplo, API, contratos de função)
  - Não introduz dependências desnecessárias ou violações de camada

---

## 13.4 Common Mistakes & Debugging

**Error: `Path is not exported from this module`**
- Causa: Importando de um arquivo que apenas re-exporta
- Solução: Importe diretamente do arquivo original
```typescript
// ❌ ERRADO
import { FreteRepository } from "@/repositories"; // index.ts não existe

// ✅ CORRETO
import { FreteRepository } from "@/infrastructure/repositories/FreteRepository";
```

**Error: `Cannot find module '@/lib/session'`**
- Causa: Depois da consolidação `/infrastructure`, caminhos não foram atualizados
- Solução: Procure por `@/lib/` e atualize para `@/infrastructure/lib/`
```bash
# Encontre todas as refs
grep -r "@/lib/" src/app --include="*.ts" --include="*.tsx"

# Atualize para
"@/infrastructure/lib/"
```

**Error: `Property 'organizacaoId' does not exist on type 'AuthUser'`**
- Causa: AuthUser interface não tem o campo esperado
- Solução: Verifique se getValidSession está populando corretamente
```typescript
// SessionService.ts
user: {
  id: session.user.id,
  email: session.user.email,
  organizacaoId: session.user.organizacaoId, // ← Certifique-se que existe
}
```

**Error: `revalidatePath is imported from wrong module`**
- Causa: `revalidatePath` deve vir de `next/cache`, não outro lugar
```typescript
// ✅ CORRETO
import { revalidatePath } from "next/cache";
revalidatePath("/fretes");
```

**Tests failing after restructuring:**
- Verificar se mocks estão apontando para os caminhos corretos
```typescript
// ❌ ERRADO — para o arquivo antigo
vi.mock("@/services/autenticacao/AutenticacaoServico");

// ✅ CORRETO — para o novo caminho
vi.mock("@/infrastructure/services/autenticacao/AutenticacaoServico");
```

---

## 14. Arquitetura de Três Camadas (Padrão Evolutivo)

> Esta seção define a arquitetura-alvo do Falcon. Todo código **novo** deve seguir estes padrões rigorosamente. Ao tocar em código **existente**, avalie se faz sentido refatorar para esta arquitetura — especialmente quando o trecho for complexo ou estiver sendo alterado significativamente.

### 14.1 Visão Geral

O projeto evolui para uma separação explícita em três camadas, inspirada em Clean Architecture e DDD tático:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│         src/app/**  ·  src/actions/**  ·  src/components/**     │
│         Next.js puro — functions, Server Actions, RSC           │
│         Sem regras de negócio. Apenas orquestra UI ↔ Core.     │
└───────────────────────────┬─────────────────────────────────────┘
                            │  chama (via interfaces)
┌───────────────────────────▼─────────────────────────────────────┐
│                       CORE LAYER                                │
│          src/services/**  ·  src/types/**  ·  src/schemas/**    │
│          Casos de uso, regras de negócio, DTOs, interfaces      │
│          Classes + Interfaces + Injeção de Dependência          │
└───────────────────────────┬─────────────────────────────────────┘
                            │  depende de (via interfaces)
┌───────────────────────────▼─────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                           │
│    src/repositories/**  ·  src/lib/**  ·  src/workers/**        │
│    Persistência, adaptadores, bibliotecas externas              │
│    Classes concretas que implementam interfaces do Core         │
└─────────────────────────────────────────────────────────────────┘
```

**Regra de dependência**: as dependências sempre apontam de fora para dentro. Presentation → Core ← Infrastructure. O Core nunca depende das outras camadas — apenas define interfaces.

---

### 14.2 Camada de Apresentação (Presentation)

**O quê**: tudo relacionado ao Next.js — páginas (`src/app/`), Server Actions (`src/actions/`) e componentes (`src/components/`).

**Como**: segue o padrão nativo do Next.js com **funções** (não classes). Server Actions usam `"use server"`, Client Components usam `"use client"`. Nenhuma regra de negócio aqui.

**Responsabilidades**:
- Renderizar UI e gerenciar estado de apresentação
- Receber input do usuário e delegar ao Core via Actions
- Lidar com sessão (`requireOrgSession`) e autorização de acesso
- Chamar `revalidatePath()` após mutações

**Proibido**:
- ❌ Lógica de negócio (validações de domínio, cálculos, regras)
- ❌ Acesso direto ao banco de dados (Prisma)
- ❌ Importar repositórios ou adaptadores concretos

```typescript
// ✅ Presentation — Server Action delegando ao Core
"use server";

import { revalidatePath } from "next/cache";
import { sessionService } from "@/lib/session";
import { FreteService } from "@/services/fretes/FreteService";
import { FreteRepository } from "@/repositories/FreteRepository";

export async function criarFrete(data: unknown) {
  const { organizacaoId } = await sessionService.requireOrgSession();

  // Instancia o serviço injetando a dependência
  const repository = new FreteRepository();
  const service = new FreteService(repository);

  const frete = await service.criar(data, organizacaoId);
  revalidatePath("/fretes");
  return { success: true, frete };
}
```

---

### 14.3 Camada de Core (Negócio)

**O quê**: `src/services/`, `src/types/`, `src/schemas/`. Coração do sistema — regras de negócio, casos de uso, DTOs e contratos (interfaces).

**Como**: **classes + interfaces**. Os serviços recebem suas dependências via construtor (injeção de dependência). Nunca instanciam repositórios ou adaptadores internamente.

**Responsabilidades**:
- Orquestrar casos de uso (ex: criar frete, calcular valor ANTT, registrar manutenção)
- Definir interfaces de repositórios e serviços externos que o Core precisa
- Validar dados de entrada com Zod
- Lançar erros de domínio em português

**Estrutura de uma feature no Core**:
```
src/services/fretes/
  IFreteRepository.ts      ← interface definida pelo Core
  FreteService.ts          ← caso de uso principal
  CriarFreteDTO.ts         ← DTO de entrada/saída
```

```typescript
// ✅ Core — Interface definindo o contrato (src/services/fretes/IFreteRepository.ts)
import type { CriarFreteDTO } from "./CriarFreteDTO";
import type { Frete } from "@/types/frete";

export interface IFreteRepository {
  criar(data: CriarFreteDTO): Promise<Frete>;
  buscarPorId(id: string, organizacaoId: string): Promise<Frete | null>;
  listar(organizacaoId: string): Promise<Frete[]>;
}
```

```typescript
// ✅ Core — Serviço com injeção de dependência (src/services/fretes/FreteService.ts)
import { criarFreteSchema } from "@/schemas/frete";
import { calcularValorAntt } from "@/services/antt/calcularFrete";
import { generateId } from "@/utils/uuid";
import { logger } from "@/lib/logger";
import type { IFreteRepository } from "./IFreteRepository";

export class FreteService {
  constructor(private readonly repository: IFreteRepository) {}

  async criar(data: unknown, organizacaoId: string) {
    if (!organizacaoId) throw new Error("Organization ID é obrigatório");

    const validated = criarFreteSchema.parse(data);

    // Regra de negócio: calcular e armazenar o valor mínimo ANTT para auditoria
    const valorMinimoAntt = calcularValorAntt({
      distanciaKm: validated.distanciaKm,
      tipoCarga: validated.tipoCarga,
      pesoKg: validated.pesoCargaKg,
    });

    const frete = await this.repository.criar({
      id: generateId(),
      ...validated,
      valorMinimoAntt,
      organizacaoId,
    });

    logger.info("frete:criado", { freteId: frete.id, organizacaoId, valorMinimoAntt });
    return frete;
  }
}
```

```typescript
// ✅ Core — DTO (src/services/fretes/CriarFreteDTO.ts)
import type { z } from "zod";
import type { criarFreteSchema } from "@/schemas/frete";

export type CriarFreteDTO = z.infer<typeof criarFreteSchema> & {
  id: string;
  organizacaoId: string;
  valorMinimoAntt: number;
};
```

---

### 14.4 Camada de Infraestrutura (Infrastructure)

**O quê**: `src/repositories/`, `src/lib/`, `src/workers/`. Implementações concretas que satisfazem os contratos definidos pelo Core.

**Como**: **classes concretas** que implementam as interfaces do Core. Encapsulam detalhes de Prisma, APIs externas, filas, cache, etc.

**Responsabilidades**:
- Implementar interfaces de repositório definidas no Core
- Adaptar bibliotecas externas (Prisma, SMTP, APIs de terceiros) para contratos internos
- Isolar detalhes técnicos do resto do sistema

**Proibido**:
- ❌ Regras de negócio dentro dos repositórios
- ❌ Importar outros serviços do Core (dependência inversa)
- ❌ Expor objetos Prisma diretamente para o Core — mapeie para tipos do domínio quando necessário

```typescript
// ✅ Infrastructure — Repositório concreto implementando a interface do Core
// src/repositories/FreteRepository.ts

import { prisma } from "@/lib/db";
import type { IFreteRepository } from "@/services/fretes/IFreteRepository";
import type { CriarFreteDTO } from "@/services/fretes/CriarFreteDTO";

export class FreteRepository implements IFreteRepository {
  async criar(data: CriarFreteDTO) {
    return prisma.frete.create({ data });
  }

  async buscarPorId(id: string, organizacaoId: string) {
    return prisma.frete.findFirst({
      where: { id, organizacaoId, deletadoEm: null },
    });
  }

  async listar(organizacaoId: string) {
    return prisma.frete.findMany({
      where: { organizacaoId, deletadoEm: null },
      orderBy: { data: "desc" },
    });
  }
}
```

---

### 14.5 Injeção de Dependência

Usamos **injeção manual via construtor** — sem frameworks de DI. O ponto de composição (onde as dependências são montadas) é sempre a **Action Layer**.

```typescript
// Composition root: Action
const repository = new FreteRepository();   // Infrastructure
const service = new FreteService(repository); // Core recebe a infra
const resultado = await service.criar(data, organizacaoId);
```

**Benefícios**:
- Testabilidade: basta injetar um mock nos testes unitários do Core
- Desacoplamento: o Core nunca sabe qual banco ou lib está sendo usado
- Substituibilidade: trocar Prisma por outro ORM só requer nova implementação da interface

```typescript
// ✅ Teste unitário do Core sem banco de dados
const mockRepository: IFreteRepository = {
  criar: vi.fn().mockResolvedValue(mockFrete),
  buscarPorId: vi.fn().mockResolvedValue(null),
  listar: vi.fn().mockResolvedValue([]),
};

const service = new FreteService(mockRepository);
const resultado = await service.criar(validData, AUTH_TEST_UUIDS.ORG_ID);
expect(resultado).toEqual(mockFrete);
```

---

### 14.5.1 Unit of Work Pattern — Transações sem Acoplamento

Para casos que requerem múltiplas operações de banco de dados em uma única transação, use o padrão **Unit of Work**:

**1. Definir abstração no Core:**
```typescript
// src/core/abstractions/IUnitOfWork.ts
export interface IUnitOfWork {
  executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
```

**2. Implementar em Infrastructure com Prisma:**
```typescript
// src/infrastructure/services/onboarding/PrismaUnitOfWork.ts
import { prisma } from "@/infrastructure/lib/db";
import type { IUnitOfWork } from "@/core/abstractions/IUnitOfWork";

export class PrismaUnitOfWork implements IUnitOfWork {
  async executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return (await prisma.$transaction(fn as any)) as T;
  }
}
```

**3. Usar no Core com injeção:**
```typescript
// src/core/casosDeUso/onboarding/OnboardingServico.ts
export class OnboardingServico {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepositorio,
    private readonly usuarioRepo: IUsuarioRepositorio
  ) {}

  async concluir(userId: string, dto: ConcluirOnboardingDto) {
    const organizacaoId = generateId();

    // UoW garante atomicidade sem o Core saber de Prisma
    await this.uow.executar(async (tx) => {
      await this.organizacaoRepo.criar(organizacao, tx);
      await this.usuarioRepo.atualizar(usuario, tx);
    });

    return { organizacaoId };
  }
}
```

**4. Montar no Action (composition root):**
```typescript
// src/app/_actions/onboarding/concluirOnboarding.ts
export async function completeOnboarding(data: unknown) {
  const { organizacaoId } = await sessionService.requireUser();

  const uow = new PrismaUnitOfWork();
  const orgRepo = new PrismaOrganizacaoRepositorio();
  const usuarioRepo = new PrismaUsuarioRepositorio();

  const servico = new OnboardingServico(uow, orgRepo, usuarioRepo);
  const useCase = new ConcluirOnboardingUseCase(servico);
  const handler = new ConcluirOnboardingCommandHandler(useCase);

  const resultado = await handler.handle(userId, dados);
  // ...
}
```

**Benefícios do padrão:**
- ✅ Core **não depende de Prisma** — agnóstico ao banco
- ✅ Transações **encapsuladas em Infrastructure**
- ✅ Testes podem injetar mock de `IUnitOfWork` trivialmente
- ✅ Trocar `$transaction` por outro padrão só afeta `PrismaUnitOfWork`

---

### 14.6 Regras de Responsabilidade por Camada

| Elemento | Camada | Padrão |
|---|---|---|
| Páginas e layouts | Presentation | Funções Next.js |
| Server Actions | Presentation | Funções `async` com `"use server"` |
| Client Components | Presentation | Funções React com `"use client"` |
| Casos de uso | Core | Classes com injeção de dependência |
| Interfaces de repositório | Core | `interface I<Nome>Repository` |
| Interfaces de abstrações | Core | `interface IUnitOfWork`, etc. |
| DTOs | Core | Types inferidos de Zod ou interfaces explícitas |
| Schemas Zod | Core (`src/schemas/`) | Exportados como `camelCaseSchema` |
| Types de domínio | Core (`src/types/`) | Interfaces TypeScript |
| Implementações de repositório | Infrastructure | Classes que implementam `I<Nome>Repository` |
| Implementações de abstrações | Infrastructure | `PrismaUnitOfWork`, etc. |
| Adaptadores de libs externas | Infrastructure | Classes com interface própria |
| Configuração de infra (auth, db) | Infrastructure (`src/lib/`) | Singletons de configuração |

---

### 14.7 Política de Migração do Código Existente

O código existente **não precisa ser reescrito imediatamente**. A estratégia é:

1. **Código novo**: sempre nascerá no padrão de três camadas descrito acima.
2. **Ao tocar código existente**: avalie o contexto. Se a alteração for pequena (ex: correção de bug), mantenha o padrão atual. Se for uma refatoração significativa ou nova feature sobre o módulo, migre para o padrão de três camadas naquele momento.
3. **Priorize migração quando**:
   - O serviço crescer com múltiplos casos de uso
   - Houver necessidade de testes unitários isolados
   - O código atual misturar regras de negócio com acesso a banco
4. **Nunca migre pela metade**: se iniciar a refatoração de um módulo, conclua a migração para o padrão de três camadas naquele PR.

---

## 15. Workspace Organization & Feature Structure

### 15.1 Folder Layout

Each feature follows a clear, predictable structure across all layers:

```
src/
  core/
    abstractions/             # Transaction and generic patterns
      IUnitOfWork.ts          # Unit of Work interface for transactions
    
    repositorios/             # Repository interfaces defined by Core
      IOrganizacaoRepositorio.ts
      IUsuarioRepositorio.ts
    
    models/                   # Type definitions (no runtime)
      usuario.ts
      organizacao.ts
    
    casosDeUso/              # Use case interfaces and DTOs
      autenticacao/
        IAutenticacaoServico.ts
        dtos/
          RegistroDTO.ts
          RegistroResultadoDTO.ts
  
  services/                  # Business logic interfaces and orchestration
    autenticacao/
      AutenticacaoServico.ts           # Implements IAutenticacaoServico
      RegistrarUsuarioUseCase.ts       # Implements IRegistrarUsuarioUseCase
  
  infrastructure/
    services/                # Concrete implementations of abstractions
      autenticacao/
        AutenticacaoServico.ts         # Wraps better-auth
        dtos/
          RegistroDTO.ts               # Re-exported from core
      onboarding/
        PrismaUnitOfWork.ts            # Implements IUnitOfWork
      SessionService.ts                # Session management
    
    repositories/            # Database access layer
      PrismaOrganizacaoRepositorio.ts # Implements IOrganizacaoRepositorio
      PrismaUsuarioRepositorio.ts     # Implements IUsuarioRepositorio
      UsuarioRepository.ts
      FreteRepository.ts
    
    lib/                     # Singletons and utilities
      auth.ts                # better-auth config
      db.ts                  # Prisma client
      session.ts             # Session utilities
      logger.ts              # Structured logging
  
  application/
    handlers/                # Composition roots for features
      RegistroUsuarioCommandHandler.ts
    commands/                # Command DTOs
      RegistroUsuarioCommand.ts
  
  app/
    _actions/                # Server actions grouped by domain
      auth/
        registrarUsuario.ts
        login.ts
    _components/             # React components grouped by domain
      auth/
        RegisterForm.tsx
        LoginForm.tsx

tests/
  core/                      # Test interfaces and contracts
    auth/
      IAutenticacaoServico.test.ts
  services/                  # Test business logic
    autenticacao/
      AutenticacaoServico.test.ts
  infrastructure/            # Test implementations
    repositories/
      FreteRepository.test.ts
  application/               # Test composition and handlers
    handlers/
      RegistroUsuarioCommandHandler.test.ts
  mocks/                     # Shared test utilities
    auth.ts                  # AUTH_TEST_UUIDS, builders
    prisma.ts                # Prisma mocks
```

### 15.2 Feature Development Checklist

When adding a new feature (e.g., `criarFrete`):

**1. DEFINE (Core Layer)**
- Create interface: `src/core/casosDeUso/fretes/IFreteServico.ts`
- Create DTOs: `src/core/casosDeUso/fretes/dtos/CriarFreteDTO.ts`
- Update models: `src/core/models/frete.ts` if needed

**2. IMPLEMENT (Infrastructure + Services)**
- Implement repository: `src/infrastructure/repositories/FreteRepository.ts`
- Implement service: `src/infrastructure/services/fretes/FreteServico.ts`
- Implement use case: `src/services/fretes/CriarFreteUseCase.ts`

**3. COMPOSE (Application)**
- Create handler: `src/application/handlers/CriarFreteCommandHandler.ts`
- Create command: `src/application/commands/CriarFreteCommand.ts`

**4. EXPOSE (Presentation)**
- Create action: `src/app/_actions/fretes/criar.ts`
- Create component: `src/app/_components/fretes/FreteForm.tsx`
- Page: `src/app/(private)/fretes/criar/page.tsx`

**5. TEST (All Layers)**
- Core tests: Define expected behavior with Zod validation
- Infrastructure tests: Mock Prisma, verify org filtering
- Application tests: Verify handler and action composition
- Follow RED-GREEN-REFACTOR pattern in each test file

**6. VALIDATE**
- `pnpm lint` passes (ESLint + Prettier)
- `pnpm vitest run` passes (all new tests)
- `pnpm build` succeeds (no TypeScript errors)
- Error messages in **Portuguese (pt-BR)**
- No console.log — use `logger.info()` or `logger.error()`

### 15.3 Common Patterns for New Features

**Pattern: Adding a New Mutation**

```typescript
// 1. Core — Define interface at src/core/casosDeUso/fretes/IFreteServico.ts
export interface IFreteServico {
  criar(dto: CriarFreteDTO): Promise<Frete>;
}

// 2. Infrastructure — Implement at src/infrastructure/services/fretes/FreteServico.ts
export class FreteServico implements IFreteServico {
  constructor(private readonly repository: IFreteRepository) {}
  
  async criar(dto: CriarFreteDTO) {
    // validation, business logic, logging
    return this.repository.criar(dto);
  }
}

// 3. Application — Compose at src/application/handlers/CriarFreteCommandHandler.ts
export class CriarFreteCommandHandler {
  constructor(
    private readonly repository: IFreteRepository,
    private readonly service: IFreteServico
  ) {}
  
  async handle(command: CriarFreteCommand) {
    try {
      const frete = await this.service.criar(command.data);
      return { success: true, data: frete };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 4. Presentation — Expose via Server Action at src/app/_actions/fretes/criar.ts
"use server";
import { revalidatePath } from "next/cache";
import { sessionService } from "@/infrastructure/lib/session";
import { CriarFreteCommandHandler } from "@/application/handlers/CriarFreteCommandHandler";

export async function criarFreteAction(data: unknown) {
  const { organizacaoId } = await sessionService.requireOrgSession();
  
  const handler = new CriarFreteCommandHandler(
    new FreteRepository(),
    new FreteServico(new FreteRepository())
  );
  
  const result = await handler.handle(new CriarFreteCommand(data, organizacaoId));
  
  if (result.success) {
    revalidatePath("/fretes");
  }
  
  return result;
}
```

---

## 16. Regra de Formatação de Dados

**Objetivo**: Separação clara de responsabilidades — formatação de dados (moeda, data, etc.) ocorre **sempre** na camada Core/Serviço, nunca na apresentação (components, pages, actions).

### 16.1 Princípio Fundamental

A camada de apresentação (UI) **nunca** formata dados. Ela recebe **ViewModels** com campos já convertidos para strings prontas para exibição. Isso garante:

- ✅ **Desacoplamento de UI**: mudar a formatação não afeta componentes
- ✅ **Performance**: sem `Intl.` no bundle do cliente
- ✅ **Consistência**: único ponto de formatação para cada domínio
- ✅ **Testabilidade**: lógica de formatação no Core, testável isoladamente

### 16.2 Onde Formatar

**✅ CORRETO — Handlers/Serviços do Core**

Os handlers de casos de uso retornam **ViewModels** com campos formatados:

```typescript
// src/core/casosDeUso/fretes/ListarFretesHandler.ts
import { formatBRL } from "@/utils/moeda";
import { formatDate } from "@/utils/data";

export class ListarFretesHandler {
  async executar(organizacaoId: string): Promise<FreteListViewModel[]> {
    const fretes = await this.repository.listar(organizacaoId);
    
    return fretes.map(f => ({
      id: f.id,
      origem: f.origem,
      destino: f.destino,
      distanciaKm: f.distanciaKm,                    // número puro
      valorFormatado: formatBRL(f.valor),            // ← FORMATADO
      dataFormatada: formatDate(f.data),             // ← FORMATADO
      valorMinimoAnttFormatado: formatBRL(f.valorMinimoAntt), // ← FORMATADO
    }));
  }
}
```

**❌ ERRADO — RSC/Pages/Components Formatando**

```typescript
// ❌ NUNCA FAÇA ISSO EM uma page.tsx ou component
const fretes = await db.frete.findMany({ where: { organizacaoId } });

export function FreteList({ fretes }) {
  return fretes.map(f => (
    <div>
      {/* ❌ NÃO FORMATAR AQUI */}
      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valor)}</span>
      <span>{f.data.toLocaleDateString('pt-BR')}</span>
    </div>
  ));
}
```

### 16.3 O Quê Formatar

Sempre formatar os seguintes tipos de dados na saída de handlers/serviços:

| Tipo | Função | Exemplo |
|---|---|---|
| **Moeda (BRL)** | `formatBRL(value)` | `formatBRL(1500)` → `"R$ 1.500,00"` |
| **Data** | `formatDate(value)` | `formatDate(new Date())` → `"15/01/2024"` |
| **Data+Hora** | `formatDateTime(value)` | `formatDateTime(new Date())` → `"15/01/2024 10:30"` |
| **CPF** | `formatCPF(value)` (se implementado) | `formatCPF("12345678901")` → `"123.456.789-01"` |
| **Telefone** | conforme padrão (se aplicável) | coordenar com design |
| **Porcentagem** | `value.toFixed(2) + "%"` no handler | `15.5%` |

### 16.4 Como Estruturar ViewModels

Um ViewModel é a interface entre Core e Presentation. Deve estender `IViewModel` e usar sufixo `Formatado` para campos já convertidos:

```typescript
// src/core/casosDeUso/fretes/viewModels/FreteListViewModel.ts
import type { IViewModel } from "@/core/abstraction/viewModels";

export interface FreteListViewModel extends IViewModel {
  readonly id: string;
  readonly origem: string;
  readonly destino: string;
  readonly distanciaKm: number;                         // número puro — UI usa como quiser
  readonly valorFormatado: string;                      // ← formatado (BRL → string)
  readonly dataFormatada: string;                       // ← formatado (Date → string)
  readonly valorMinimoAnttFormatado: string;            // ← formatado (BRL → string)
}
```

**Regra**: Campos formatados **sempre** têm sufixo `Formatado` e são `readonly string`.

### 16.5 Padrão Completo: Action → Handler → ViewModel → UI

**Step 1: Action delega ao handler**
```typescript
// src/app/_actions/fretes/listar.ts
"use server";

import { container } from "@/container";
import { sessionService } from "@/infra/lib/session";

export async function listarFretesAction() {
  const { organizacaoId } = await sessionService.requireOrgSession();
  const viewModels = await container.listarFretesHandler.executar(organizacaoId);
  return viewModels;
}
```

**Step 2: Handler formata e retorna ViewModel**
```typescript
// src/core/casosDeUso/fretes/ListarFretesHandler.ts
import { formatBRL } from "@/utils/moeda";
import { formatDate } from "@/utils/data";
import type { FreteListViewModel } from "./viewModels/FreteListViewModel";

export class ListarFretesHandler {
  constructor(private readonly repository: IFreteRepository) {}

  async executar(organizacaoId: string): Promise<FreteListViewModel[]> {
    const fretes = await this.repository.listar(organizacaoId);
    
    return fretes.map(f => ({
      id: f.id,
      origem: f.origem,
      destino: f.destino,
      distanciaKm: f.distanciaKm,
      valorFormatado: formatBRL(f.valor),
      dataFormatada: formatDate(f.data),
      valorMinimoAnttFormatado: formatBRL(f.valorMinimoAntt),
    }));
  }
}
```

**Step 3: UI recebe ViewModel com strings prontas**
```typescript
// src/app/fretes/page.tsx
import { listarFretesAction } from "@/app/_actions/fretes/listar";

export default async function FretesPage() {
  const fretes = await listarFretesAction();

  return (
    <ul>
      {fretes.map(f => (
        <li key={f.id}>
          <strong>{f.origem} → {f.destino}</strong>
          <p>Valor: {f.valorFormatado}</p>               {/* ← Já formatado */}
          <p>Data: {f.dataFormatada}</p>                 {/* ← Já formatado */}
          <p>{f.distanciaKm} km</p>                      {/* ← número puro */}
        </li>
      ))}
    </ul>
  );
}
```

### 16.6 Proibições na Camada de Apresentação

❌ **Nunca faça isso em components, pages, ou actions:**

```typescript
// ❌ Importar funções de formatação
import { formatBRL } from "@/utils/moeda";

// ❌ Usar Intl.* diretamente
new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// ❌ Chamar métodos de formatação em Date
date.toLocaleString('pt-BR')
date.toLocaleDateString('pt-BR')

// ❌ Usar toFixed() ou toString() para moeda
valor.toFixed(2)

// ❌ Usar libraries de formatação (date-fns, moment, etc.) em UI
import { format } from 'date-fns';
format(date, 'dd/MM/yyyy')

// ❌ Transformar dados dentro de map() ou render
<span>{new Date(frete.data).toLocaleDateString('pt-BR')}</span>
```

### 16.7 Funções de Formatação Disponíveis

**Em `@/utils/moeda.ts`:**
```typescript
formatBRL(value: number | { toNumber(): number } | null | undefined): string
```
Formata valores em BRL usando `Intl.NumberFormat('pt-BR')`.

**Em `@/utils/data.ts`:**
```typescript
formatDate(value: Date | string | null | undefined): string
formatDateTime(value: Date | string | null | undefined): string
parseDate(value: unknown): Date | null
parsePlainIsoDate(value: string): Date
```

Todas as funções de data respeitam o timezone `America/Sao_Paulo` (UTC-3).

### 16.8 Validação Final

Após implementar formatação, valide:

- [ ] Nenhum `Intl.` em `src/app/**`, `src/_components/**`, `src/_actions/**`
- [ ] Nenhum `formatBRL` ou `formatDate` importado fora de Core/Handlers
- [ ] Todos os handlers retornam ViewModels com sufixo `Formatado` para strings
- [ ] UI exibe apenas campos `Formatado` (numéricos puros sem transformação)
- [ ] Mensagens de erro do Core em português (pt-BR)
- [ ] Testes do Core validam formatação; testes de UI validam apenas exibição

*This file is intended for agentic and human development use. Keep it updated as the project evolves.*

