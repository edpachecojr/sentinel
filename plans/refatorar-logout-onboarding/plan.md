# Refatorar Logout e Onboarding para Arquitetura em Camadas

**Branch:** `refactor/logout-onboarding-architecture`  
**Description:** Extrair os fluxos de logout e conclusão de onboarding para o padrão Command/Handler/UseCase já adotado para login e registro, eliminando os serviços legacy desconectados.

---

## Goal

O `UserDropdown.tsx` chama `signOut()` do `better-auth/react` diretamente no cliente, sem nenhuma camada intermediária. O onboarding usa um serviço monolítico que acessa `prisma.$transaction()` diretamente, ignorando os repositórios existentes (`OrganizationRepository`, `UserRepository`). O objetivo é estruturar ambos os fluxos com o padrão consolidado: `Command → Handler → UseCase → Servico`, tornando cada parte testável em isolamento e eliminando os serviços legacy (`services/onboarding/complete.ts`, `services/users/completeOnboarding.ts`, `services/organizations/create.ts`).

---

## Implementation Steps

### Step 1: Core — Logout: Interface, SairUseCase

**Files:**
- `src/core/auth/IAutenticacaoServico.ts` *(atualizar — substituir `invalidarSessao(token)` por `sair(): Promise<void>`)*
- `src/core/casosDeUso/autenticacao/SairUsuario.ts` *(novo)*

**What:**  
`invalidarSessao(token: string)` e `validarSessao(token: string)` são stubs que nunca foram implementados e cujas assinaturas não se encaixam no modelo server-side do better-auth (session determinada pelos headers/cookies, não por token explícito). Substituir `invalidarSessao` por `sair(): Promise<void>` na interface, mantendo `validarSessao` e `obterUsuarioPorToken` como stubs para uso futuro. Criar `SairUsuarioUseCase` que recebe `IAutenticacaoServico` por injeção de dependência e delega a chamada — sem DTOs separados, pois logout não produz dados de saída além de `void`.

```typescript
// IAutenticacaoServico.ts — assinatura atualizada
export interface IAutenticacaoServico {
  registrar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado>;
  autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado>;
  sair(): Promise<void>;
  validarSessao(token: string): Promise<boolean>;          // stub, mantido
  obterUsuarioPorToken(token: string): Promise<Usuario>;  // stub, mantido
}

// SairUsuario.ts
export class SairUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(): Promise<void> {
    return this.autenticacaoServico.sair();
  }
}
```

**Testing:**
- `pnpm tsc --noEmit` sem erros de tipo.
- Criar `tests/core/auth/SairUsuarioUseCase.test.ts`: mock de `IAutenticacaoServico`, verificar que `executar()` chama `sair()` exatamente uma vez e propaga qualquer erro lançado.
- Corrigir bug colateral: `tests/application/handlers/RegistroUsuarioCommandHandler.test.ts` linha 7 — atualizar path do mock de `"@/core/useCases/auth/RegistrarUsuarioUseCase"` para `"@/core/casosDeUso/autenticacao/RegistrarUsuario"`.

---

### Step 2: Infrastructure — Implementar `sair()` em AutenticacaoServico

**Files:**
- `src/infrastructure/services/autenticacao/AutenticacaoServico.ts` *(atualizar)*

**What:**  
Implementar `sair()` no `AutenticacaoServico` (que atualmente lança `"not implemented"` para `invalidarSessao`). Deve chamar `auth.api.signOut({ headers: await headers() })` do `next/headers`. Com o plugin `nextCookies()` já configurado em `auth.ts`, o cookie de sessão é limpo automaticamente sem necessidade de propagação manual.

```typescript
async sair(): Promise<void> {
  const response = await auth.api.signOut({
    headers: await headers(),
    asResponse: true,
  });

  if (!response.ok) {
    throw new AuthenticationError("Falha ao encerrar sessão.");
  }
}
```

**Testing:**
- Estender `tests/services/autenticacao/AutenticacaoServico.test.ts` com:
  - `sair()` chama `auth.api.signOut()` com headers corretos.
  - Lança `AuthenticationError` quando `response.ok === false`.

---

### Step 3: Application — SairCommandHandler

**Files:**
- `src/application/handlers/SairCommandHandler.ts` *(novo)*

**What:**  
Criar `SairCommandHandler` sem Command Zod (logout não tem input de usuário para validar). O handler instancia `AutenticacaoServico` e `SairUsuarioUseCase` em seu construtor (Composition Root), expõe `handle()` sem argumentos e retorna o tipo discriminado `RespostaSair`. Segue o mesmo padrão de `AutenticacaoCommandHandler`.

```typescript
export type RespostaSair =
  | { success: true }
  | { success: false; error: string };

export class SairCommandHandler {
  private readonly useCase: SairUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new SairUsuarioUseCase(autenticacaoServico);
  }

  async handle(): Promise<RespostaSair> {
    try {
      await this.useCase.executar();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao encerrar sessão.";
      return { success: false, error: message };
    }
  }
}
```

**Testing:**
- Criar `tests/application/handlers/SairCommandHandler.test.ts`: mock de `SairUsuarioUseCase.prototype.executar`, cobrir sucesso + erro conhecido + erro inesperado.

---

### Step 4: Presentation — Server Action de Logout + Atualizar UserDropdown

**Files:**
- `src/app/_actions/auth/sair.ts` *(novo)*
- `src/app/_components/header/UserDropdown.tsx` *(atualizar)*

**What:**  
Criar `sairAction()`: server action que instancia `SairCommandHandler`, chama `handle()` e, em caso de sucesso, executa `redirect("/login")`. Atualizar `UserDropdown.tsx` para remover a chamada a `signOut()` do `better-auth/react` e chamar `sairAction()` via `startTransition`. Remover o import de `signOut` de `auth-client.ts` no componente.

```typescript
// src/app/_actions/auth/sair.ts
"use server";

import { redirect } from "next/navigation";
import { SairCommandHandler } from "@/application/handlers/SairCommandHandler";

export type EstadoSair =
  | { success: true }
  | { success: false; error: string };

export async function sairAction(): Promise<EstadoSair> {
  const handler = new SairCommandHandler();
  const resultado = await handler.handle();

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/login");
}
```

```typescript
// UserDropdown.tsx — trecho atualizado
import { startTransition } from "react";
import { sairAction } from "@/app/_actions/auth/sair";

async function handleSignOut() {
  setIsPending(true);
  startTransition(async () => {
    try {
      await sairAction();
    } catch (err) {
      // redirect() do next/navigation lança internamente — ignorar
    } finally {
      setIsPending(false);
    }
  });
}
```

**Testing:**
- Logout manual: clicar em "Sair" → cookie de sessão removido (DevTools > Application > Cookies) → redirect para `/login` → tentar acessar `/dashboard` redireciona para `/login`.
- `pnpm build` e `pnpm lint` passam sem erros.

---

### Step 5: Core — Onboarding: IOnboardingServico, DTOs e ConcluirOnboardingUseCase

**Files:**
- `src/core/onboarding/IOnboardingServico.ts` *(novo)*
- `src/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto.ts` *(novo)*
- `src/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado.ts` *(novo)*
- `src/core/casosDeUso/onboarding/ConcluirOnboarding.ts` *(novo)*

**What:**  
Definir a interface `IOnboardingServico` com o método `concluir()` que recebe `userId` + DTO de entrada e retorna o resultado com `organizacaoId`. Criar DTOs e `ConcluirOnboardingUseCase` que delega ao serviço via injeção de dependência. O `userId` é passado explicitamente (nunca lido do contexto pelo UseCase — responsabilidade da camada de apresentação).

```typescript
// ConcluirOnboardingDto.ts
export type ConcluirOnboardingDto = {
  displayName: string;
  orgName: string;
};

// ConcluirOnboardingResultado.ts
export type ConcluirOnboardingResultado = {
  organizacaoId: string;
};

// IOnboardingServico.ts
export interface IOnboardingServico {
  concluir(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado>;
}

// ConcluirOnboarding.ts
export class ConcluirOnboardingUseCase {
  constructor(private readonly onboardingServico: IOnboardingServico) {}

  async executar(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado> {
    if (!userId) throw new Error("User ID é obrigatório para concluir o onboarding.");
    return this.onboardingServico.concluir(userId, dto);
  }
}
```

**Testing:**
- `pnpm tsc --noEmit` sem erros.
- Criar `tests/core/onboarding/ConcluirOnboardingUseCase.test.ts`: mock de `IOnboardingServico`, verificar delegação correta e validação de `userId` vazio.

---

### Step 6: Infrastructure — OnboardingServico

**Files:**
- `src/infrastructure/services/onboarding/OnboardingServico.ts` *(novo)*

**What:**  
Criar `OnboardingServico implements IOnboardingServico`. O método `concluir()` usa `prisma.$transaction()` para garantir atomicidade: cria a organização (via `OrganizationRepository`) e atualiza o usuário (via `UserRepository`) em uma mesma transação. A helpers `generateSlug` e `generateId` são reutilizadas. **Diferença do serviço atual**: usa repositórios em vez de acessar `prisma` diretamente, exceto para coordenar a transação.

```typescript
// OnboardingServico.ts
import { prisma } from "@/lib/db";
import { OrganizationRepository } from "@/infrastructure/repositories/OrganizationRepository";
import { UserRepository } from "@/infrastructure/repositories/UserRepository";
import { generateId } from "@/utils/uuid";
import type { IOnboardingServico } from "@/core/onboarding/IOnboardingServico";
import type { ConcluirOnboardingDto, ConcluirOnboardingResultado } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto";

function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class OnboardingServico implements IOnboardingServico {
  async concluir(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado> {
    const organizacaoId = generateId();

    await prisma.$transaction(async (tx) => {
      await new OrganizationRepository(tx).create({
        id: organizacaoId,
        nome: dto.orgName,
        slug: generateSlug(dto.orgName),
      });
      await new UserRepository(tx).update(userId, {
        displayName: dto.displayName,
        organizacaoId,
        onboardingCompleted: true,
      });
    });

    return { organizacaoId };
  }
}
```

> **Nota técnica sobre repositories + transaction:** Os repositórios `OrganizationRepository` e `UserRepository` precisarão aceitar um cliente Prisma opcional no construtor para suportar `prisma.$transaction()`. Se os repositórios atuais não aceitarem `tx` como parâmetro, a alternativa válida é chamar `tx.organizacao.create()` e `tx.user.update()` diretamente dentro do `OnboardingServico.concluir()`, mantendo a transação. A decisão deve priorizar atomicidade sobre pureza arquitetural neste caso.

**Testing:**
- Criar `tests/services/onboarding/OnboardingServico.test.ts`: mock de `prisma.$transaction`, verificar que cria organização e atualiza usuário com os dados corretos.
- `pnpm tsc --noEmit` sem erros.

---

### Step 7: Application — ConcluirOnboardingCommand + ConcluirOnboardingCommandHandler

**Files:**
- `src/application/commands/ConcluirOnboardingCommand.ts` *(novo)*
- `src/application/handlers/ConcluirOnboardingCommandHandler.ts` *(novo)*

**What:**  
`ConcluirOnboardingCommand` é o schema Zod que valida o input do usuário (`displayName`, `orgName`), reaproveitando as regras dos schemas existentes (`organizacaoSchema`, `usuarioSchema`). `ConcluirOnboardingCommandHandler` recebe `{ userId, displayName, orgName }` em `handle()`, instancia `OnboardingServico` e `ConcluirOnboardingUseCase` no construtor.

```typescript
// ConcluirOnboardingCommand.ts
export const concluirOnboardingCommand = z.object({
  displayName: z.string().trim().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).max(100),
  orgName: z.string().trim().min(2, { message: "Nome da empresa deve ter pelo menos 2 caracteres" }).max(100),
});
export type ConcluirOnboardingCommand = z.infer<typeof concluirOnboardingCommand>;

// ConcluirOnboardingCommandHandler.ts
export type RespostaOnboarding<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ConcluirOnboardingCommandHandler {
  private readonly useCase: ConcluirOnboardingUseCase;

  constructor() {
    const onboardingServico = new OnboardingServico();
    this.useCase = new ConcluirOnboardingUseCase(onboardingServico);
  }

  async handle(
    userId: string,
    dto: ConcluirOnboardingCommand
  ): Promise<RespostaOnboarding<ConcluirOnboardingResultado>> {
    try {
      const resultado = await this.useCase.executar(userId, dto);
      return { success: true, data: resultado };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao concluir onboarding.";
      return { success: false, error: message };
    }
  }
}
```

**Testing:**
- `pnpm tsc --noEmit` sem erros.
- Criar `tests/application/handlers/ConcluirOnboardingCommandHandler.test.ts`: mock de `ConcluirOnboardingUseCase.prototype.executar`, cobrir sucesso + erro.

---

### Step 8: Presentation — Atualizar Action + Page + Remover Serviços Antigos

**Files:**
- `src/app/_actions/onboarding/complete.ts` *(atualizar)*
- `src/app/(onboarding)/onboarding/page.tsx` *(atualizar — remover função inline `"use server"`)*
- `src/infrastructure/services/onboarding/complete.ts` *(remover)*
- `src/infrastructure/services/users/completeOnboarding.ts` *(remover)*
- `src/infrastructure/services/organizations/create.ts` *(remover)*

**What:**  
Atualizar `completeOnboarding` action para: (1) validar input com `concluirOnboardingCommand.safeParse()`, (2) obter `userId` via `sessionService.requireUser()`, (3) delegar ao `ConcluirOnboardingCommandHandler`, (4) redirecionar para `/dashboard` ao sucesso. Atualizar `OnboardingPage` para importar diretamente `completeOnboarding` como referência de função (sem inline `"use server"`). Remover os três serviços legacy.

```typescript
// complete.ts — versão refatorada
"use server";

import { redirect } from "next/navigation";
import { sessionService } from "@/lib/session";
import { concluirOnboardingCommand } from "@/application/commands/ConcluirOnboardingCommand";
import { ConcluirOnboardingCommandHandler } from "@/application/handlers/ConcluirOnboardingCommandHandler";

export type EstadoOnboarding =
  | { success: true; organizacaoId: string }
  | { success: false; error: string };

export async function completeOnboarding(data: unknown): Promise<EstadoOnboarding> {
  const user = await sessionService.requireUser();

  const parsed = concluirOnboardingCommand.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const handler = new ConcluirOnboardingCommandHandler();
  const resultado = await handler.handle(user.id, parsed.data);

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/dashboard");
}
```

**Testing:**
- Fluxo manual completo: registro → onboarding → submit → redirect `/dashboard`.
- Verificar no banco: `displayName` e `organizacaoId` no usuário + organização criada.
- Verificar que `onboardingCompleted = true` no usuário.
- `pnpm tsc --noEmit`, `pnpm lint` e `pnpm vitest run` passam.

---

## Arquivos Afetados — Resumo

| Arquivo | Ação |
|---|---|
| `src/core/auth/IAutenticacaoServico.ts` | Atualizar: `invalidarSessao(token)` → `sair(): Promise<void>` |
| `src/core/casosDeUso/autenticacao/SairUsuario.ts` | Criar |
| `src/core/onboarding/IOnboardingServico.ts` | Criar |
| `src/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto.ts` | Criar |
| `src/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado.ts` | Criar |
| `src/core/casosDeUso/onboarding/ConcluirOnboarding.ts` | Criar |
| `src/infrastructure/services/autenticacao/AutenticacaoServico.ts` | Atualizar: implementar `sair()` |
| `src/infrastructure/services/onboarding/OnboardingServico.ts` | Criar |
| `src/infrastructure/services/onboarding/complete.ts` | **Remover** |
| `src/infrastructure/services/users/completeOnboarding.ts` | **Remover** |
| `src/infrastructure/services/organizations/create.ts` | **Remover** |
| `src/application/handlers/SairCommandHandler.ts` | Criar |
| `src/application/commands/ConcluirOnboardingCommand.ts` | Criar |
| `src/application/handlers/ConcluirOnboardingCommandHandler.ts` | Criar |
| `src/app/_actions/auth/sair.ts` | Criar |
| `src/app/_actions/onboarding/complete.ts` | Atualizar |
| `src/app/_components/header/UserDropdown.tsx` | Atualizar: remover `signOut()` client-side |
| `src/app/(onboarding)/onboarding/page.tsx` | Atualizar: remover função inline `"use server"` |
| `tests/core/auth/SairUsuarioUseCase.test.ts` | Criar |
| `tests/core/onboarding/ConcluirOnboardingUseCase.test.ts` | Criar |
| `tests/services/autenticacao/AutenticacaoServico.test.ts` | Estender: cobrir `sair()` |
| `tests/services/onboarding/OnboardingServico.test.ts` | Criar |
| `tests/application/handlers/SairCommandHandler.test.ts` | Criar |
| `tests/application/handlers/ConcluirOnboardingCommandHandler.test.ts` | Criar |
| `tests/application/handlers/RegistroUsuarioCommandHandler.test.ts` | Corrigir: path do mock incorreto |

---

## Notas Técnicas

### Logout e Propagação de Cookie
O plugin `nextCookies()` já está configurado em `auth.ts` (adicionado no plano `registro-para-onboarding`). Isso garante que `auth.api.signOut({ headers: await headers() })` limpe o cookie de sessão automaticamente via `Set-Cookie` sem propagação manual. A `sairAction()` pode usar `asResponse: true` e verificar `response.ok` para garantir que o signout foi bem-sucedido antes de redirecionar.

### Onboarding: Repositórios e Transação
Se os `OrganizationRepository` e `UserRepository` não aceitam um cliente de transação (`tx`) em seu construtor, o `OnboardingServico.concluir()` deve acessar `prisma.$transaction()` com queries inline (`tx.organizacao.create()`, `tx.user.update()`), priorizando atomicidade. A refatoração dos repositórios para suportar injeção de `tx` pode ser feita como uma tarefa separada futura.

### Remoção dos Serviços Legacy
Os três serviços removidos (`onboarding/complete.ts`, `users/completeOnboarding.ts`, `organizations/create.ts`) são funcionalmente substituídos pelo `OnboardingServico.ts`. Verificar com `grep` que nenhum outro arquivo os importa antes de deletar.

### SairCommand — Omitido Intencionalmente
Logout não possui input de usuário para validar, portanto não há schema Zod associado. O `SairCommandHandler.handle()` é chamado sem argumentos. Isso é uma exceção justificada ao padrão — consistente com o fato de que o fluxo é disparado por um clique, não por um formulário.
