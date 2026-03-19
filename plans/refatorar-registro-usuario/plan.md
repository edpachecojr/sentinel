# Refatoração do Processo de Registro de Usuário

**Branch:** `feat/refatorar-registro-usuario`
**Descrição:** Separar as responsabilidades do fluxo de registro em camadas bem definidas, introduzindo CommandHandler, UseCase e AuthenticationService conforme a arquitetura de três camadas do AGENTS.md.

## Contexto

### Estado atual (problemas identificados)

| Problema | Localização |
|---|---|
| Schema duplicado | `_schemas/registerSchema.ts` ≈ `application/commands/RegistroUsuarioCommand.ts` |
| `application/handlers/` vazio | Command já existe mas nunca foi ligado a nada |
| `IAutenticacaoServico` sem método `registrar()` | `core/auth/IAutenticacaoServico.ts` |
| Registro direto no cliente | `RegisterForm.tsx` chama `authClient.signUp.email()` sem camada de serviço |
| Sem server action para registro | Sem ponto de entrada server-side para criar usuário |
| Nenhum `AutenticacaoServico` concreto | Interface existe, implementação não |
| `nextCookies()` ausente em `lib/auth.ts` | Necessário para server actions definirem cookies de sessão |

### Mapeamento do fluxo novo (pós-refatoração)

```
RegisterForm (cliente)
  → registrarUsuarioAction()         [valida com Zod safeParse — thin layer]
    → RegistroUsuarioCommandHandler  [orquestra, trata erros, formata resposta]
      → RegistrarUsuarioUseCase      [regras de negócio, usa IAutenticacaoServico]
        → AutenticacaoServico        [chama auth.api.signUpEmail — infra]
          → better-auth              [cria usuário + sessão + seta cookie via nextCookies]
```

---

## Goal

Separar as responsabilidades do registro de usuário em camadas bem definidas (Command → Handler → UseCase → Service), eliminando a duplicação de schema e tornando cada peça testável de forma isolada. A `RegisterForm` passa a chamar uma server action em vez de chamar `authClient` diretamente.

---

## Implementation Steps

### Step 1: Estender IAutenticacaoServico e definir DTOs de registro

**Files:**
- `src/core/auth/IAutenticacaoServico.ts`
- `src/services/autenticacao/dtos/RegistroDTO.ts` *(novo)*

**What:**
Adicionar o método `registrar()` à interface existente `IAutenticacaoServico`, definindo o contrato que a implementação concreta deverá cumprir. Criar os DTOs de entrada (`RegistroDTO`) e saída (`RegistroResultadoDTO`) que trafegam entre camadas.

> A interface fica no **Core**; os DTOs são tipos simples (não classes), idealmente colocados em `src/services/autenticacao/dtos/` (Core também).

```typescript
// IAutenticacaoServico — extensão
registrar(data: RegistroDTO): Promise<RegistroResultadoDTO>;

// RegistroDTO
export type RegistroDTO = {
  nome: string;
  email: string;
  senha: string;
};

// RegistroResultadoDTO
export type RegistroResultadoDTO = {
  usuarioId: string;
};
```

**Testing:** Verificar que TypeScript valida a interface sem erros: `pnpm tsc --noEmit`.

---

### Step 2: Adicionar nextCookies ao auth.ts e implementar AutenticacaoServico

**Files:**
- `src/lib/auth.ts`
- `src/services/autenticacao/AutenticacaoServico.ts` *(novo)*

**What:**
Adicionar o plugin `nextCookies()` em `src/lib/auth.ts` para que `auth.api.signUpEmail()` chamado de uma server action defina corretamente o Set-Cookie de sessão. Em seguida, criar `AutenticacaoServico` (camada Infrastructure/Service) implementando `IAutenticacaoServico.registrar()` usando `auth.api.signUpEmail()`.

> Os métodos existentes da interface (`autenticar`, `validarSessao`, `invalidarSessao`, `obterUsuarioPorToken`) serão marcados como `throw new Error("not implemented")` por enquanto, para manter conformidade com TypeScript sem bloquear a refatoração atual.

```typescript
// src/services/autenticacao/AutenticacaoServico.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";
import type { RegistroDTO, RegistroResultadoDTO } from "./dtos/RegistroDTO";

export class AutenticacaoServico implements IAutenticacaoServico {
  async registrar(data: RegistroDTO): Promise<RegistroResultadoDTO> {
    const resultado = await auth.api.signUpEmail({
      body: { name: data.nome, email: data.email, password: data.senha },
      headers: await headers(),
    });
    if (!resultado?.user) throw new Error("Falha ao registrar usuário.");
    return { usuarioId: resultado.user.id };
  }
  // outros métodos: throw new Error("not implemented")
}
```

**Testing:** `pnpm tsc --noEmit` sem erros. Verificar que `nextCookies` foi importado e adicionado ao array `plugins`.

---

### Step 3: Criar RegistrarUsuarioUseCase

**Files:**
- `src/services/usuarios/RegistrarUsuarioUseCase.ts` *(novo)*

**What:**
Criar o caso de uso que encapsula as **regras de negócio** do registro. Recebe `IAutenticacaoServico` por injeção de dependência no construtor. Por ora as regras de negócio são mínimas (validar que email não está em lista negra, futuramente: verificar plano, etc.), mas a estrutura fica pronta para escalar.

```typescript
// src/services/usuarios/RegistrarUsuarioUseCase.ts
import type { IAutenticacaoServico } from "@/core/auth/IAutenticacaoServico";
import type { RegistroDTO, RegistroResultadoDTO } from "@/services/autenticacao/dtos/RegistroDTO";

export class RegistrarUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}

  async executar(data: RegistroDTO): Promise<RegistroResultadoDTO> {
    // Ponto de extensão: adicionar regras de negócio antes de registrar
    // Ex: checar domínios bloqueados, verificar plano, etc.
    return this.autenticacaoServico.registrar(data);
  }
}
```

**Testing:** `pnpm tsc --noEmit`. Teste unitário em `tests/services/usuarios/RegistrarUsuarioUseCase.test.ts` mockando `IAutenticacaoServico`.

---

### Step 4: Criar RegistroUsuarioCommandHandler

**Files:**
- `src/application/handlers/RegistroUsuarioCommandHandler.ts` *(novo — pasta estava vazia)*

**What:**
Criar o handler que orquestra a chamada, compõe as dependências (Composition Root) e formata a resposta em um tipo discriminado `{ success: true, data } | { success: false, error }`. É o único lugar onde `AutenticacaoServico` e `RegistrarUsuarioUseCase` são instanciados e conectados.

```typescript
// src/application/handlers/RegistroUsuarioCommandHandler.ts
import { AutenticacaoServico } from "@/services/autenticacao/AutenticacaoServico";
import { RegistrarUsuarioUseCase } from "@/services/usuarios/RegistrarUsuarioUseCase";
import type { RegistroDTO } from "@/services/autenticacao/dtos/RegistroDTO";

export type RespostaRegistro<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class RegistroUsuarioCommandHandler {
  private readonly useCase: RegistrarUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new RegistrarUsuarioUseCase(autenticacaoServico);
  }

  async handle(data: RegistroDTO): Promise<RespostaRegistro<{ usuarioId: string }>> {
    try {
      const resultado = await this.useCase.executar(data);
      return { success: true, data: { usuarioId: resultado.usuarioId } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao registrar.";
      return { success: false, error: message };
    }
  }
}
```

**Testing:** `pnpm tsc --noEmit`. O handler não precisa de teste unitário próprio (ele é Composition Root); a cobertura vem pelos testes do UseCase e do e2e/integration da action.

---

### Step 5: Criar server action + consolidar schema + atualizar RegisterForm

**Files:**
- `src/app/_actions/auth/registrarUsuario.ts` *(novo)*
- `src/application/commands/RegistroUsuarioCommand.ts` *(ajuste: remover `confirmPassword` do tipo exportado — pertence apenas à UI)*
- `src/app/_schemas/registerSchema.ts` *(remover — duplicata do Command)*
- `src/app/_components/auth/RegisterForm.tsx` *(atualizar import do schema e trocar authClient por server action)*

**What:**
Criar a server action `registrarUsuarioAction()` (camada mais fina possível): valida o input com `registroUsuarioCommand.safeParse()`, transforma para `RegistroDTO` (sem `confirmPassword`) e delega ao `RegistroUsuarioCommandHandler`. Atualizar `RegisterForm.tsx` para:
1. Importar `RegisterFormValues` de `@/application/commands/RegistroUsuarioCommand` (eliminando a duplicata)
2. Chamar `registrarUsuarioAction()` via `useTransition` em vez de `authClient.signUp.email()`

```typescript
// src/app/_actions/auth/registrarUsuario.ts
"use server";

import { registroUsuarioCommand } from "@/application/commands/RegistroUsuarioCommand";
import { RegistroUsuarioCommandHandler } from "@/application/handlers/RegistroUsuarioCommandHandler";

export type EstadoRegistro =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function registrarUsuarioAction(data: unknown): Promise<EstadoRegistro> {
  const parsed = registroUsuarioCommand.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const handler = new RegistroUsuarioCommandHandler();
  const resultado = await handler.handle({
    nome: parsed.data.name,
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  return { success: true, usuarioId: resultado.data.usuarioId };
}
```

**Testing:**
- `pnpm tsc --noEmit`
- `pnpm lint`
- Teste manual: criar conta via UI → verificar redirect para `/onboarding` e cookie de sessão setado
- Verificar no banco que o usuário foi criado
