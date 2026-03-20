# Refatorar Autenticação de Usuário

**Branch:** `refactor/autenticacao-usuario-command-handler`  
**Description:** Extrair o fluxo de login para o padrão Command/Handler/UseCase, espelhando exatamente o que foi feito com o registro de usuário.

---

## Goal

O `LoginForm` atualmente chama `authClient.signIn.email()` diretamente no client, sem nenhuma camada intermediária. O objetivo é estruturar o processo de autenticação com o padrão já consolidado no projeto: `Command → Handler → UseCase → AutenticacaoServico`, adicionando validação Zod server-side, testabilidade por camada e consistência arquitetural.

---

## Estado Atual vs. Estado Alvo

| Elemento | Registro ✅ | Login (atual) ❌ | Login (alvo) ✅ |
|---|---|---|---|
| Command (Zod) | `RegistroUsuarioCommand` | — | `AutenticarUsuarioCommand` |
| Handler | `RegistroUsuarioCommandHandler` | — | `AutenticacaoCommandHandler` |
| UseCase | `RegistrarUsuarioUseCase` | — | `AutenticarUsuarioUseCase` |
| DTO entrada | `RegistrarUsuarioDto` | — | `AutenticarUsuarioDto` |
| DTO saída | `RegistrarUsuarioResultado` | — | `AutenticarUsuarioResultado` |
| IAutenticacaoServico | `registrar()` ✅ | `autenticar()` stub (throws) | `autenticar()` implementado |
| Server Action | `registrarUsuario.ts` | — | `autenticarUsuario.ts` |
| LoginForm | N/A | `authClient.signIn.email()` direto | chama Server Action |

---

## Implementation Steps

### Step 1: Core – DTOs, UseCase e Atualização da Interface

**Files:**
- `src/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto.ts` *(novo)*
- `src/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioResultado.ts` *(novo)*
- `src/core/casosDeUso/autenticacao/AutenticarUsuario.ts` *(novo)*
- `src/core/auth/IAutenticacaoServico.ts` *(atualizar assinatura de `autenticar()`)*

**What:**  
Criar os DTOs de entrada (`AutenticarUsuarioDto`) e saída (`AutenticarUsuarioResultado`) para o caso de uso de login. Criar a classe `AutenticarUsuarioUseCase` que recebe `IAutenticacaoServico` via injeção de dependência e delega a chamada. Atualizar a interface `IAutenticacaoServico` substituindo a assinatura de `autenticar(email, senha): Promise<string>` por `autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado>` — mantendo a coerência com o padrão de `registrar()`.

**DTOs:**
```typescript
// AutenticarUsuarioDto.ts
export type AutenticarUsuarioDto = {
  email: string;
  senha: string;
};

// AutenticarUsuarioResultado.ts
export type AutenticarUsuarioResultado = {
  usuarioId: string;
};
```

**UseCase:**
```typescript
// AutenticarUsuario.ts
export class AutenticarUsuarioUseCase {
  constructor(private readonly autenticacaoServico: IAutenticacaoServico) {}
  async executar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado> {
    return this.autenticacaoServico.autenticar(dto);
  }
}
```

**Testing:**  
- `tests/core/auth/AutenticarUsuarioUseCase.test.ts`: mock de `IAutenticacaoServico`, verifica que `executar()` delega corretamente para `autenticar()` e retorna `AutenticarUsuarioResultado`.

---

### Step 2: Infrastructure – Implementar `autenticar()` no AutenticacaoServico

**Files:**
- `src/infrastructure/services/autenticacao/AutenticacaoServico.ts` *(atualizar)*

**What:**  
Implementar o método `autenticar()` no `AutenticacaoServico` (que atualmente lança `"not implemented"`). Deve chamar `auth.api.signInEmail()` da mesma forma que `registrar()` chama `auth.api.signUpEmail()`. O método recebe `AutenticarUsuarioDto` e retorna `AutenticarUsuarioResultado`.

> **Atenção – cookies e sessão:** `auth.api.signInEmail()` define o cookie de sessão na resposta. Para propagar esse cookie a partir de um Server Action, utilizar a opção `asResponse: true` da chamada, extrair o header `set-cookie` e reaplicar via `cookies()` do `next/headers`. Isso garante que a sessão seja estabelecida corretamente no navegador.

**Implementação referência:**
```typescript
async autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado> {
  const response = await auth.api.signInEmail({
    body: { email: dto.email, password: dto.senha },
    headers: await headers(),
    asResponse: true,
  });

  if (!response.ok) {
    throw new AuthenticationError("Email ou senha incorretos.");
  }

  const data = await response.json();
  if (!data?.user?.id) throw new AuthenticationError("Falha ao autenticar usuário.");

  // Propaga cookies de sessão
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    // Parseia e seta cada cookie de sessão individualmente
    for (const cookie of setCookie.split(", ")) {
      const [nameValue] = cookie.split(";");
      const [name, value] = nameValue.split("=");
      if (name && value) cookieStore.set(name.trim(), value.trim(), { httpOnly: true, path: "/" });
    }
  }

  return { usuarioId: data.user.id };
}
```

**Testing:**  
- `tests/services/autenticacao/AutenticacaoServico.test.ts`: estender os testes existentes com:
  - `autenticar()` chama `auth.api.signInEmail()` com email e senha corretos
  - Lança `AuthenticationError` quando `response.ok === false`
  - Lança `AuthenticationError` quando `data.user` é nulo

---

### Step 3: Application – Command e Handler

**Files:**
- `src/application/commands/AutenticarUsuarioCommand.ts` *(novo)*
- `src/application/handlers/AutenticacaoCommandHandler.ts` *(novo)*

**What:**  
Criar o `AutenticarUsuarioCommand` como schema Zod (validação de borda: email válido, senha mínima), espelhando `RegistroUsuarioCommand`. Criar o `AutenticacaoCommandHandler` que instancia `AutenticacaoServico` e `AutenticarUsuarioUseCase`, executa o caso de uso e retorna `RespostaAutenticacao<{ usuarioId }>`.

**Command:**
```typescript
// AutenticarUsuarioCommand.ts
export const autenticarUsuarioCommand = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});
export type AutenticarUsuarioCommand = z.infer<typeof autenticarUsuarioCommand>;
```

**Handler:**
```typescript
// AutenticacaoCommandHandler.ts
export type RespostaAutenticacao<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class AutenticacaoCommandHandler {
  private readonly useCase: AutenticarUsuarioUseCase;

  constructor() {
    const autenticacaoServico = new AutenticacaoServico();
    this.useCase = new AutenticarUsuarioUseCase(autenticacaoServico);
  }

  async handle(dto: AutenticarUsuarioDto): Promise<RespostaAutenticacao<{ usuarioId: string }>> {
    try {
      const resultado = await this.useCase.executar(dto);
      return { success: true, data: { usuarioId: resultado.usuarioId } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao autenticar.";
      return { success: false, error: message };
    }
  }
}
```

**Testing:**  
- `tests/application/handlers/AutenticacaoCommandHandler.test.ts`:
  - Mock de `AutenticacaoServico` e `AutenticarUsuarioUseCase`
  - Sucesso retorna `{ success: true, data: { usuarioId } }`
  - Erro retorna `{ success: false, error: "..." }`

---

### Step 4: Presentation – Server Action e Atualização do LoginForm

**Files:**
- `src/app/_actions/auth/autenticarUsuario.ts` *(novo)*
- `src/app/_components/auth/LoginForm.tsx` *(atualizar)*
- `src/app/_schemas/loginSchema.ts` *(mover para `src/application/commands/AutenticarUsuarioCommand.ts` — schema já criado no Step 3 substitui este arquivo)*

**What:**  
Criar o Server Action `autenticarUsuarioAction` que valida o input com `autenticarUsuarioCommand` (Zod), delega ao `AutenticacaoCommandHandler` e retorna `EstadoLogin`. Atualizar o `LoginForm` para: (1) remover a chamada a `authClient.signIn.email()`, (2) usar `useActionState` ou `startTransition` + `autenticarUsuarioAction`, (3) redirecionar para `/dashboard` ao receber `success: true`.

**Server Action:**
```typescript
"use server";

import { autenticarUsuarioCommand } from "@/application/commands/AutenticarUsuarioCommand";
import { AutenticacaoCommandHandler } from "@/application/handlers/AutenticacaoCommandHandler";

export type EstadoLogin =
  | { success: true; usuarioId: string }
  | { success: false; error: string };

export async function autenticarUsuarioAction(data: unknown): Promise<EstadoLogin> {
  const parsed = autenticarUsuarioCommand.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(errorMap)[0] as keyof typeof errorMap;
    const firstError = firstField ? errorMap[firstField]?.[0] : undefined;
    return { success: false, error: firstError ?? "Dados inválidos" };
  }

  const handler = new AutenticacaoCommandHandler();
  const resultado = await handler.handle({
    email: parsed.data.email,
    senha: parsed.data.password,
  });

  if (!resultado.success) return { success: false, error: resultado.error };
  return { success: true, usuarioId: resultado.data.usuarioId };
}
```

**Testing:**  
- Verificar manualmente que o fluxo completo funciona: preencher o LoginForm → submit → cookie de sessão estabelecido → redirecionamento para `/dashboard`.
- Confirmar que `pnpm build` e `pnpm lint` passam sem erros.

---

## Arquivos Afetados — Resumo

| Arquivo | Ação |
|---|---|
| `src/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioDto.ts` | Criar |
| `src/core/casosDeUso/autenticacao/dtos/AutenticarUsuarioResultado.ts` | Criar |
| `src/core/casosDeUso/autenticacao/AutenticarUsuario.ts` | Criar |
| `src/core/auth/IAutenticacaoServico.ts` | Atualizar assinatura de `autenticar()` |
| `src/infrastructure/services/autenticacao/AutenticacaoServico.ts` | Implementar `autenticar()` |
| `src/application/commands/AutenticarUsuarioCommand.ts` | Criar |
| `src/application/handlers/AutenticacaoCommandHandler.ts` | Criar |
| `src/app/_actions/auth/autenticarUsuario.ts` | Criar |
| `src/app/_components/auth/LoginForm.tsx` | Atualizar |
| `tests/core/auth/AutenticarUsuarioUseCase.test.ts` | Criar |
| `tests/services/autenticacao/AutenticacaoServico.test.ts` | Estender |
| `tests/application/handlers/AutenticacaoCommandHandler.test.ts` | Criar |

---

## Notas Técnicas

### Propagação de Cookie no Server Action
O desafio central desta refatoração é que `auth.api.signInEmail()` define cookies de sessão via headers HTTP. Em um Server Action do Next.js, é necessário propagar esses cookies manualmente usando `cookies()` de `next/headers`. A implementação no Step 2 usa `asResponse: true` para obter a `Response` completa e extrai o `set-cookie` para reaplicar via `cookieStore.set()`.

### loginSchema vs AutenticarUsuarioCommand
O `src/app/_schemas/loginSchema.ts` existente pode ser mantido para uso no `LoginForm` (validação client-side / display), mas a validação autoritativa server-side passa a ser o `AutenticarUsuarioCommand`. Não é necessário deletar o arquivo.

### Compatibilidade com Social Login
O `LoginForm` pode ter botões de social login (Google) via `authClient`. Esses não são afetados por esta refatoração — permanecem client-side via `authClient.signIn.social()`.
