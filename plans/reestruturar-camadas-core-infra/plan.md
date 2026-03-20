# Reestruturar Camadas Core e Infra

**Branch:** `refactor/reestruturar-camadas-core-infra`
**Description:** Alinhar as camadas `core/` e `infrastructure/` à arquitetura definida em ARCHITECTURE.MD, eliminando use cases separados, corrigindo violações de dependência e criando um composition root centralizado.

## Goal

Reestruturar o código para seguir a arquitetura de três camadas definida em ARCHITECTURE.MD: `core/` (entidades, abstrações, handlers), `infra/` (implementações concretas, UoW, repositórios, serviços externos) e `container.ts` (composition root). Eliminar a camada intermediária de use cases, incorporando a lógica de orquestração diretamente nos handlers. Remover todas as violações da regra de dependência (Core → Infra).

---

## Contexto Atual (Gaps Identificados)

| Gap | Descrição | Impacto |
|---|---|---|
| G1 | Handlers de auth instanciam `AutenticacaoServico` (infra) diretamente no core | 🔴 Crítico |
| G2 | `container.ts` ausente — composição é manual e inconsistente | 🔴 Crítico |
| G3 | `core/models/` usa classes em vez de interfaces; deve ser `core/entidades/` | 🟡 Médio |
| G4 | `core/abstractions/` (plural) vs `core/abstraction/` (singular) do ARCHITECTURE.MD | 🟢 Baixo |
| G5 | `core/repositorios/` deve mover para `core/abstraction/repositories/` | 🟡 Médio |
| G6 | `IAutenticacaoServico` está em `core/casosDeUso/autenticacao/` em vez de `core/abstraction/servicos/` | 🟡 Médio |
| G7 | UseCase separado existe para auth e onboarding (ex: `AutenticarUsuario.ts`, `ConcluirOnboarding.ts`) | 🟡 Médio |
| G8 | `OnboardingServico.ts` vive em `core/casosDeUso/onboarding/` — serviço de negócio no lugar errado | 🟡 Médio |
| G9 | `PrismaUnitOfWork` em `infrastructure/services/onboarding/` em vez de `infrastructure/unitOfWork/` | 🟢 Baixo |
| G10 | Pasta `infrastructure/` deve ser `infra/`; `infrastructure/lib/db.ts` deve ser `infra/db/prismaClient.ts` | 🟢 Baixo |
| G11 | Repositórios legados sem interface (`OrganizationRepository.ts`, `UserRepository.ts`) | 🟡 Médio |
| G12 | `IAutenticacaoServico` tem métodos não implementados (`validarSessao`, `obterUsuarioPorToken`) | 🔴 Crítico |
| G13 | Commands contêm schemas Zod — devem ser interfaces puras; Zod pertence à apresentação | 🟡 Médio |
| G14 | Pastas vazias: `core/onboarding/`, `core/casosDeUso/autenticacao/registrarUsuario/` | 🟢 Baixo |

---

## Estrutura Alvo

```
src/
├── core/
│   ├── entidades/
│   │   ├── usuario.ts                          ← interface (não classe)
│   │   └── organizacao.ts                      ← interface (não classe)
│   ├── abstraction/
│   │   ├── repositories/
│   │   │   ├── IUsuarioRepositorio.ts
│   │   │   └── IOrganizacaoRepositorio.ts
│   │   ├── servicos/
│   │   │   └── IAutenticacaoServico.ts
│   │   ├── errors/
│   │   │   └── auth.ts
│   │   └── IUnitOfWork.ts
│   └── casosDeUso/
│       ├── autenticacao/
│       │   ├── autenticarUsuario.command.ts    ← interface pura (sem Zod)
│       │   ├── autenticarUsuarioHandler.ts     ← handler com lógica embutida
│       │   ├── registrarUsuario.command.ts
│       │   ├── registrarUsuarioHandler.ts
│       │   ├── sair.command.ts
│       │   └── sairHandler.ts
│       └── onboarding/
│           ├── concluirOnboarding.command.ts   ← interface pura (sem Zod)
│           └── concluirOnboardingHandler.ts    ← handler com lógica embutida
│
├── infra/                                      ← renomeado de infrastructure/
│   ├── db/
│   │   └── prismaClient.ts                     ← movido de infrastructure/lib/db.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── auth-client.ts
│   │   └── logger.ts
│   ├── repositories/
│   │   ├── PrismaOrganizacaoRepositorio.ts
│   │   └── PrismaUsuarioRepositorio.ts
│   ├── unitOfWork/
│   │   └── PrismaUnitOfWork.ts                 ← movido de infrastructure/services/onboarding/
│   └── servicos/
│       ├── AutenticacaoServico.ts
│       └── SessionService.ts
│
└── container.ts                                ← NOVO: composition root
```

---

## Implementation Steps

### Step 1: Refatorar `core/entidades/` e `core/abstraction/`

**Files:**
- DELETE `src/core/models/Organizacao.ts` → CREATE `src/core/entidades/organizacao.ts`
- DELETE `src/core/models/Usuario.ts` → CREATE `src/core/entidades/usuario.ts`
- DELETE `src/core/abstractions/IUnitOfWork.ts` → CREATE `src/core/abstraction/IUnitOfWork.ts`
- DELETE `src/core/abstractions/errors/auth.ts` → CREATE `src/core/abstraction/errors/auth.ts`
- DELETE `src/core/repositorios/IOrganizacaoRepositorio.ts` → CREATE `src/core/abstraction/repositories/IOrganizacaoRepositorio.ts`
- DELETE `src/core/repositorios/IUsuarioRepositorio.ts` → CREATE `src/core/abstraction/repositories/IUsuarioRepositorio.ts`
- DELETE `src/core/casosDeUso/autenticacao/IAutenticacaoServico.ts` → CREATE `src/core/abstraction/servicos/IAutenticacaoServico.ts`
- DELETE pastas vazias: `src/core/onboarding/`, `src/core/casosDeUso/autenticacao/registrarUsuario/`
- UPDATE todos os imports que referenciam `@/core/models/`, `@/core/abstractions/`, `@/core/repositorios/`

**What:**
Converter entidades de classes para interfaces (ARCHITECTURE.MD §3.1 — classes só se houver comportamento). Reorganizar a pasta de abstrações de `abstractions/` para `abstraction/` e consolidar os contratos de repositórios e serviços em `core/abstraction/`. Simplificar `IAutenticacaoServico` removendo métodos não implementados (`validarSessao`, `obterUsuarioPorToken`).

**Entidade `organizacao` (interface):**
```typescript
// core/entidades/organizacao.ts
export interface Organizacao {
  id: string;
  nome: string;
  slug: string;
  plano?: string;
  criadoEm?: Date;
}
```

**Entidade `usuario` (interface):**
```typescript
// core/entidades/usuario.ts
export interface Usuario {
  id: string;
  displayName: string;
  email: string;
  organizacaoId?: string;
  onboardingCompleted: boolean;
  criadoEm?: Date;
}
```

**`IAutenticacaoServico` simplificado:**
```typescript
// core/abstraction/servicos/IAutenticacaoServico.ts
export interface RegistrarUsuarioParams { nome: string; email: string; senha: string; }
export interface RegistrarUsuarioResultado { usuarioId: string; }
export interface AutenticarUsuarioParams { email: string; senha: string; }
export interface AutenticarUsuarioResultado { usuarioId: string; }

export interface IAutenticacaoServico {
  registrar(params: RegistrarUsuarioParams): Promise<RegistrarUsuarioResultado>;
  autenticar(params: AutenticarUsuarioParams): Promise<AutenticarUsuarioResultado>;
  sair(): Promise<void>;
}
```

**Testing:** `pnpm tsc --noEmit` sem erros. `pnpm vitest run` — os testes de core devem passar com imports atualizados.

---

### Step 2: Simplificar handlers de autenticação (eliminar use cases + corrigir DI)

**Files:**
- DELETE `src/core/casosDeUso/autenticacao/AutenticarUsuario.ts`
- DELETE `src/core/casosDeUso/autenticacao/RegistrarUsuario.ts`
- DELETE `src/core/casosDeUso/autenticacao/SairUsuario.ts`
- DELETE `src/core/casosDeUso/autenticacao/dtos/` (pasta inteira)
- DELETE `src/core/casosDeUso/autenticacao/commands/` (pasta antiga)
- REWRITE `src/core/casosDeUso/autenticacao/handlers/AutenticacaoCommandHandler.ts` → `src/core/casosDeUso/autenticacao/autenticarUsuarioHandler.ts`
- REWRITE `src/core/casosDeUso/autenticacao/handlers/RegistroUsuarioCommandHandler.ts` → `src/core/casosDeUso/autenticacao/registrarUsuarioHandler.ts`
- REWRITE `src/core/casosDeUso/autenticacao/handlers/SairCommandHandler.ts` → `src/core/casosDeUso/autenticacao/sairHandler.ts`
- CREATE `src/core/casosDeUso/autenticacao/autenticarUsuario.command.ts` (interface pura)
- CREATE `src/core/casosDeUso/autenticacao/registrarUsuario.command.ts` (interface pura)
- CREATE `src/core/casosDeUso/autenticacao/sair.command.ts` (interface pura — pode ser vazio)
- UPDATE `src/app/_actions/auth/autenticarUsuario.ts`, `registrarUsuario.ts`, `sair.ts`
- DELETE testes obsoletos: `tests/core/auth/AutenticarUsuarioUseCase.test.ts`, `SairUsuarioUseCase.test.ts`, `tests/services/autenticacao/`, `tests/services/usuarios/`
- UPDATE `tests/application/handlers/` → mover para `tests/core/casosDeUso/autenticacao/`

**What:**
Eliminar a camada intermediária de use cases (AutenticarUsuario, RegistrarUsuario, SairUsuario) e incorporar a lógica diretamente nos handlers. Corrigir a violação crítica onde os handlers instanciavam `AutenticacaoServico` (infra) diretamente: cada handler passa a receber `IAutenticacaoServico` via construtor. Commands se tornam interfaces TypeScript puras (sem Zod — Zod fica nas Server Actions).

**Padrão resultante:**
```typescript
// core/casosDeUso/autenticacao/autenticarUsuarioHandler.ts
import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';
import type { AutenticarUsuarioCommand, AutenticarUsuarioResult } from './autenticarUsuario.command';

export class AutenticarUsuarioHandler {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(command: AutenticarUsuarioCommand): Promise<AutenticarUsuarioResult> {
    return this.autenticacaoServico.autenticar({
      email: command.email,
      senha: command.senha,
    });
  }
}
```

**Testing:** `pnpm vitest run tests/core/` e `pnpm vitest run tests/app/` devem passar. Testar manualmente o fluxo de login e registro.

---

### Step 3: Simplificar handler de onboarding (eliminar use case + OnboardingServico)

**Files:**
- DELETE `src/core/casosDeUso/onboarding/ConcluirOnboarding.ts`
- DELETE `src/core/casosDeUso/onboarding/IOnboardingServico.ts`
- DELETE `src/core/casosDeUso/onboarding/OnboardingServico.ts`
- DELETE `src/core/casosDeUso/onboarding/dtos/` (pasta inteira)
- DELETE `src/core/casosDeUso/onboarding/commands/` (pasta antiga)
- REWRITE `src/core/casosDeUso/onboarding/handlers/ConcluirOnboardingCommandHandler.ts` → `src/core/casosDeUso/onboarding/concluirOnboardingHandler.ts`
- CREATE `src/core/casosDeUso/onboarding/concluirOnboarding.command.ts` (interface pura)
- UPDATE `src/app/_actions/onboarding/concluirOnboarding.ts`
- DELETE testes obsoletos: `tests/core/onboarding/ConcluirOnboardingUseCase.test.ts`, `tests/core/onboarding/OnboardingServico.test.ts`, `tests/services/onboarding/`
- UPDATE `tests/application/handlers/ConcluirOnboardingCommandHandler.test.ts` → mover para `tests/core/casosDeUso/onboarding/`

**What:**
Eliminar `ConcluirOnboarding.ts` (use case), `IOnboardingServico.ts` (interface desnecessária) e `OnboardingServico.ts` (serviço intermediário). O `ConcluirOnboardingHandler` passa a receber `IUnitOfWork`, `IOrganizacaoRepositorio` e `IUsuarioRepositorio` diretamente via construtor, e contém toda a lógica de orquestração (gerar ID, criar organização, atualizar usuário em transação).

**Padrão resultante:**
```typescript
// core/casosDeUso/onboarding/concluirOnboardingHandler.ts
import type { IUnitOfWork } from '@/core/abstraction/IUnitOfWork';
import type { IOrganizacaoRepositorio } from '@/core/abstraction/repositories/IOrganizacaoRepositorio';
import type { IUsuarioRepositorio } from '@/core/abstraction/repositories/IUsuarioRepositorio';
import type { ConcluirOnboardingCommand, ConcluirOnboardingResult } from './concluirOnboarding.command';
import { generateId } from '@/utils/uuid';
import { generateSlug } from '@/utils/slug';

export class ConcluirOnboardingHandler {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepositorio,
    private readonly usuarioRepo: IUsuarioRepositorio,
  ) {}

  async executar(command: ConcluirOnboardingCommand): Promise<ConcluirOnboardingResult> {
    const organizacaoId = generateId();

    await this.uow.executar(async (tx) => {
      await this.organizacaoRepo.criar(
        { id: organizacaoId, nome: command.orgName, slug: generateSlug(command.orgName) },
        tx,
      );
      await this.usuarioRepo.atualizar(
        { id: command.userId, displayName: command.displayName, organizacaoId, onboardingCompleted: true },
        tx,
      );
    });

    return { organizacaoId };
  }
}
```

**Testing:** `pnpm vitest run tests/core/onboarding/` deve passar. Testar manualmente o fluxo de onboarding.

---

### Step 4: Reorganizar e renomear `infrastructure/` → `infra/`

**Files:**
- MOVE `src/infrastructure/lib/db.ts` → `src/infra/db/prismaClient.ts`
- MOVE `src/infrastructure/lib/auth.ts` → `src/infra/lib/auth.ts`
- MOVE `src/infrastructure/lib/auth-client.ts` → `src/infra/lib/auth-client.ts`
- MOVE `src/infrastructure/lib/logger.ts` → `src/infra/lib/logger.ts`
- MOVE `src/infrastructure/services/autenticacao/AutenticacaoServico.ts` → `src/infra/servicos/AutenticacaoServico.ts`
- MOVE `src/infrastructure/services/SessionService.ts` → `src/infra/servicos/SessionService.ts`
- MOVE `src/infrastructure/services/dateTimeService.ts` → `src/infra/servicos/dateTimeService.ts`
- MOVE `src/infrastructure/services/onboarding/PrismaUnitOfWork.ts` → `src/infra/unitOfWork/PrismaUnitOfWork.ts`
- MOVE `src/infrastructure/repositories/PrismaOrganizacaoRepositorio.ts` → `src/infra/repositories/PrismaOrganizacaoRepositorio.ts`
- MOVE `src/infrastructure/repositories/PrismaUsuarioRepositorio.ts` → `src/infra/repositories/PrismaUsuarioRepositorio.ts`
- DELETE `src/infrastructure/repositories/OrganizationRepository.ts` (legado sem interface)
- DELETE `src/infrastructure/repositories/UserRepository.ts` (legado sem interface)
- DELETE `src/infrastructure/` (pasta inteira após migração)
- DELETE `src/types/organization.ts` (tipo órfão do repo legado)
- UPDATE `src/types/auth.ts` → importar de `@/infra/lib/auth`
- UPDATE todos os imports `@/infrastructure/` para `@/infra/`
- UPDATE alias no `tsconfig.json`: `@/infrastructure/*` → `@/infra/*`
- UPDATE `vitest.config.ts` com o novo alias

**What:**
Renomear a pasta de infra para `infra/` (conforme ARCHITECTURE.MD), reorganizar internamente separando `db/` (prisma client), `unitOfWork/` (PrismaUnitOfWork), `lib/` (auth, logger) e `servicos/` (implementações de serviços). Remover repositórios legados sem interface que coexistiam com as implementações corretas.

**Testing:** `pnpm build` sem erros. `pnpm vitest run` — todos os testes devem passar.

---

### Step 5: Criar `container.ts` e atualizar Server Actions

**Files:**
- CREATE `src/container.ts`
- UPDATE `src/app/_actions/auth/autenticarUsuario.ts`
- UPDATE `src/app/_actions/auth/registrarUsuario.ts`
- UPDATE `src/app/_actions/auth/sair.ts`
- UPDATE `src/app/_actions/onboarding/concluirOnboarding.ts`
- UPDATE `src/app/_actions/organizations/getOrganizationName.ts`
- UPDATE `src/app/_actions/authAction.ts`

**What:**
Criar `src/container.ts` como único ponto de composição das dependências (ARCHITECTURE.MD §7). O container instancia os repositórios, UoW e serviços concretos e os conecta aos handlers. Todas as Server Actions passam a importar os handlers prontos do container, em vez de realizar a composição manual.

**`container.ts`:**
```typescript
// src/container.ts
import { PrismaOrganizacaoRepositorio } from '@/infra/repositories/PrismaOrganizacaoRepositorio';
import { PrismaUsuarioRepositorio } from '@/infra/repositories/PrismaUsuarioRepositorio';
import { PrismaUnitOfWork } from '@/infra/unitOfWork/PrismaUnitOfWork';
import { AutenticacaoServico } from '@/infra/servicos/AutenticacaoServico';
import { AutenticarUsuarioHandler } from '@/core/casosDeUso/autenticacao/autenticarUsuarioHandler';
import { RegistrarUsuarioHandler } from '@/core/casosDeUso/autenticacao/registrarUsuarioHandler';
import { SairHandler } from '@/core/casosDeUso/autenticacao/sairHandler';
import { ConcluirOnboardingHandler } from '@/core/casosDeUso/onboarding/concluirOnboardingHandler';

// Infra
const autenticacaoServico = new AutenticacaoServico();
const organizacaoRepo = new PrismaOrganizacaoRepositorio();
const usuarioRepo = new PrismaUsuarioRepositorio();
const prismaUow = new PrismaUnitOfWork();

// Handlers
export const container = {
  autenticarUsuarioHandler: new AutenticarUsuarioHandler(autenticacaoServico),
  registrarUsuarioHandler: new RegistrarUsuarioHandler(autenticacaoServico),
  sairHandler: new SairHandler(autenticacaoServico),
  concluirOnboardingHandler: new ConcluirOnboardingHandler(prismaUow, organizacaoRepo, usuarioRepo),
};
```

**Server Action usando container:**
```typescript
// app/_actions/auth/autenticarUsuario.ts
'use server';
import { z } from 'zod';
import { container } from '@/container';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function autenticarUsuarioAction(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { sucesso: false, erros: parsed.error.flatten().fieldErrors };

  await container.autenticarUsuarioHandler.executar({
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  return { sucesso: true };
}
```

**Testing:** `pnpm build` sem erros. Testar login, registro, logout e onboarding manualmente. `pnpm vitest run` — todos os testes devem passar.

---

### Step 6: Atualizar suite de testes

**Files:**
- UPDATE `tests/setup.ts` — ajustar mocks para novos caminhos (`@/infra/`, `@/core/abstraction/`)
- DELETE `tests/core/auth/IAutenticacaoServico.test.ts` (não faz mais sentido sem a interface no local antigo)
- DELETE `tests/services/` (pasta inteira — testes de use cases eliminados)
- MOVE `tests/application/handlers/AutenticacaoCommandHandler.test.ts` → `tests/core/casosDeUso/autenticacao/autenticarUsuarioHandler.test.ts`
- MOVE `tests/application/handlers/RegistroUsuarioCommandHandler.test.ts` → `tests/core/casosDeUso/autenticacao/registrarUsuarioHandler.test.ts`
- MOVE `tests/application/handlers/SairCommandHandler.test.ts` → `tests/core/casosDeUso/autenticacao/sairHandler.test.ts`
- MOVE `tests/application/handlers/ConcluirOnboardingCommandHandler.test.ts` → `tests/core/casosDeUso/onboarding/concluirOnboardingHandler.test.ts`
- UPDATE `tests/infrastructure/` → `tests/infra/` (renomear pasta e atualizar imports)
- UPDATE `tests/mocks/auth.ts` — importar de `@/infra/lib/auth`
- UPDATE `tests/app/_actions/auth/autenticarUsuario.test.ts` e `registrarUsuario.test.ts`

**Padrão de teste para handler (DI correto):**
```typescript
// tests/core/casosDeUso/autenticacao/autenticarUsuarioHandler.test.ts
import { AutenticarUsuarioHandler } from '@/core/casosDeUso/autenticacao/autenticarUsuarioHandler';
import type { IAutenticacaoServico } from '@/core/abstraction/servicos/IAutenticacaoServico';

const mockServico: IAutenticacaoServico = {
  autenticar: vi.fn().mockResolvedValue({ usuarioId: 'user-123' }),
  registrar: vi.fn(),
  sair: vi.fn(),
};

describe('AutenticarUsuarioHandler', () => {
  it('delega ao IAutenticacaoServico com os params corretos', async () => {
    const handler = new AutenticarUsuarioHandler(mockServico);
    const result = await handler.executar({ email: 'a@b.com', senha: '12345678' });
    expect(mockServico.autenticar).toHaveBeenCalledWith({ email: 'a@b.com', senha: '12345678' });
    expect(result).toEqual({ usuarioId: 'user-123' });
  });
});
```

**Testing:** `pnpm vitest run` — 0 falhas. `pnpm lint` — 0 erros. `pnpm build` — build limpo.

---

## Checklist de Validação Final

- [ ] `pnpm tsc --noEmit` sem erros de tipagem
- [ ] `pnpm lint` sem erros ESLint
- [ ] `pnpm vitest run` — todos os testes passam
- [ ] `pnpm build` — build de produção limpo
- [ ] Nenhum arquivo em `core/` importa de `infra/` (verificar com grep)
- [ ] Nenhum handler instancia dependências internamente (apenas `container.ts`)
- [ ] Entidades em `core/entidades/` são `interface` (não `class`)
- [ ] `container.ts` é o único arquivo que instancia implementações concretas de infra
- [ ] Pastas vazias removidas
- [ ] Repositórios legados (`OrganizationRepository.ts`, `UserRepository.ts`) deletados

## Ordem de Execução Recomendada

Os steps devem ser executados em sequência, pois cada um depende do anterior:

```
Step 1 (entidades + abstraction)
  → Step 2 (handlers auth)
  → Step 3 (handler onboarding)
  → Step 4 (renomear infra)
  → Step 5 (container.ts)
  → Step 6 (testes)
```

Após cada step: rodar `pnpm tsc --noEmit` para verificar integridade dos imports antes de avançar.
