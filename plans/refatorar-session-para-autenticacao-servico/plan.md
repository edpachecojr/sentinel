# Refatorar SessionService → AutenticacaoServico

**Branch:** `refatorar-session-para-autenticacao-servico`
**Description:** Migra toda a responsabilidade de sessão do `SessionService.ts` para o `AutenticacaoServico.ts`, alinhando o projeto à arquitetura Clean Architecture definida em AGENTS.md.

## Goal

`SessionService.ts` é um singleton fora da arquitetura de camadas — mistura responsabilidades de leitura de sessão com tipos e erros que pertencem ao Core. O objetivo é absorver `getSession`, `getValidSession`, `requireUser` e `obterOrganizacao` no `AutenticacaoServico` (com injeção de dependência), eliminar o `SessionService.ts` e garantir que todos os pontos de uso (actions) passem a consumir o novo contrato via `container`.

---

## Contexto Técnico Relevante

### Usos atuais de `SessionService` (todos em Server Actions)

| Arquivo | Método consumido |
|---|---|
| `src/app/_actions/authAction.ts` | `sessionService.getValidSession()` (2×) + tipos `UnauthenticatedError`, `InactiveUserError`, `AuthUser` |
| `src/app/_actions/onboarding/concluirOnboarding.ts` | `sessionService.requireUser()` |
| `src/app/_actions/organizations/getOrganizationName.ts` | `sessionService.obterOrganizacao()` (retorna "Org" hardcoded) |

### Lacunas no Core a corrigir
- `InactiveUserError` existe só em `SessionService.ts`, não em `core/abstraction/errors/auth.ts`
- `IAutenticacaoServico` não possui métodos de sessão (`obterSessao`, `obterUsuario`, `obterOrganizacao`)
- `IOrganizacaoRepositorio` só tem `criar()` — falta `buscarPorId()` para implementar `obterOrganizacao()` de verdade
- `AutenticacaoServico` não recebe dependências via construtor — precisará de `IOrganizacaoRepositorio`

---

## Implementation Steps

### Step 1: Estender Core com tipos de sessão, erros e métodos

**Files:**
- `src/core/abstraction/errors/auth.ts`
- `src/core/abstraction/servicos/IAutenticacaoServico.ts`
- `src/core/abstraction/repositories/IOrganizacaoRepositorio.ts`

**What:**
1. Em `auth.ts` (errors): adicionar `InactiveUserError extends Error` ao lado de `UnauthenticatedError`.
2. Em `IAutenticacaoServico.ts`: definir e exportar as interfaces `UsuarioAutenticado` e `SessaoAutenticada` (substitutos de `AuthUser` e `Session`); adicionar três novos métodos à interface:
   - `obterSessao(): Promise<SessaoAutenticada | null>`
   - `obterUsuario(): Promise<UsuarioAutenticado>` — lança `UnauthenticatedError` se não autenticado
   - `obterOrganizacao(): Promise<{ id: string; nome: string } | null>` — retorna org do usuário ou `null`
3. Em `IOrganizacaoRepositorio.ts`: adicionar `buscarPorId(id: string): Promise<{ id: string; nome: string } | null>`.

**Interfaces novas (referência):**
```typescript
// IAutenticacaoServico.ts
export interface UsuarioAutenticado {
  id: string;
  email: string;
  nome?: string;
  onboardingCompleted?: boolean;
  organizacaoId?: string;
}

export interface SessaoAutenticada {
  sessao: { id: string };
  usuario: UsuarioAutenticado;
}
```

**Testing:** `pnpm tsc --noEmit` deve passar sem erros de tipagem após as mudanças nas interfaces.

---

### Step 2: Implementar `buscarPorId` no repositório de organização

**Files:**
- `src/infra/repositories/PrismaOrganizacaoRepositorio.ts`

**What:**
Adicionar o método `buscarPorId(id: string)` que executa:
```typescript
prisma.organizacao.findFirst({ where: { id, deletadoEm: null } })
```
Retornar `{ id, nome }` ou `null`. O método deve implementar a assinatura adicionada na Step 1.

**Testing:** Escrever ou atualizar teste em `tests/infrastructure/repositories/` que mocka Prisma e verifica que `buscarPorId` chama `findFirst` com `where: { id, deletadoEm: null }`.

---

### Step 3: Implementar métodos de sessão em `AutenticacaoServico`

**Files:**
- `src/infra/services/autenticacao/AutenticacaoServico.ts`

**What:**
1. Adicionar `IOrganizacaoRepositorio` como dependência injetada via construtor.
2. Implementar `obterSessao()`:
   - Chama `auth.api.getSession({ headers: await headers() })`
   - Retorna `SessaoAutenticada` mapeada ou `null` se não houver sessão
3. Implementar `obterUsuario()`:
   - Chama `obterSessao()` internamente
   - Lança `UnauthenticatedError` se `null`
   - Retorna `UsuarioAutenticado`
4. Implementar `obterOrganizacao()`:
   - Chama `obterUsuario()` para obter `organizacaoId`
   - Retorna `null` se `organizacaoId` ausente
   - Chama `this.organizacaoRepo.buscarPorId(organizacaoId)` e retorna resultado

**Nota de segurança:** `organizacaoId` deve vir **sempre da sessão** (via `auth.api.getSession`), nunca de parâmetros externos.

**Testing:** Escrever testes em `tests/infrastructure/services/autenticacao/AutenticacaoServico.test.ts`:
- Mock de `auth.api.getSession` para sessão válida → verifica que `obterUsuario()` retorna dados corretos
- Mock de `auth.api.getSession` retornando `null` → verifica que `obterUsuario()` lança `UnauthenticatedError`
- Mock de `buscarPorId` → verifica que `obterOrganizacao()` delega corretamente

---

### Step 4: Atualizar `container.ts` para injetar dependências e expor o serviço

**Files:**
- `src/container.ts`

**What:**
1. Injetar `organizacaoRepo` (já instanciado) no construtor de `AutenticacaoServico`
2. Expor `autenticacaoServico` explicitamente no objeto `container` para que as actions possam acessar via `container.autenticacaoServico`

**Antes:**
```typescript
const autenticacaoServico = new AutenticacaoServico();
export const container = { ... }; // autenticacaoServico não exposto
```

**Depois:**
```typescript
const autenticacaoServico = new AutenticacaoServico(organizacaoRepo);
export const container = {
  autenticacaoServico,  // ← exposto
  autenticarUsuarioHandler: ...,
  ...
};
```

**Testing:** `pnpm tsc --noEmit` passa; `pnpm vitest run` sem regressões.

---

### Step 5: Migrar Server Actions de `sessionService` para `container.autenticacaoServico`

**Files:**
- `src/app/_actions/authAction.ts`
- `src/app/_actions/onboarding/concluirOnboarding.ts`
- `src/app/_actions/organizations/getOrganizationName.ts`

**What:**

1. **`authAction.ts`**: substituir import de `@/infra/services/SessionService` por imports do Core (`UnauthenticatedError`, `InactiveUserError` de `@/core/abstraction/errors/auth`, tipos `SessaoAutenticada`, `UsuarioAutenticado` de `@/core/abstraction/servicos/IAutenticacaoServico`). Substituir chamadas de `sessionService.*` por `container.autenticacaoServico.*`.
   - `requireAuthOrRedirect()` → usa `container.autenticacaoServico.obterUsuario()`, captura `UnauthenticatedError` e redireciona
   - `getSessionAction()` → usa `container.autenticacaoServico.obterSessao()`

2. **`concluirOnboarding.ts`**: troca `sessionService.requireUser()` por `container.autenticacaoServico.obterUsuario()`.

3. **`getOrganizationName.ts`**: troca `sessionService.obterOrganizacao()` por `container.autenticacaoServico.obterOrganizacao()`.

**Testing:**
- `pnpm vitest run tests/app/_actions/` deve passar
- `pnpm build` não pode apresentar erros de tipagem
- Testar manualmente login → dashboard e nome da org exibido corretamente

---

### Step 6: Remover `SessionService.ts` e atualizar mocks de teste

**Files:**
- `src/infra/services/SessionService.ts` ← **deletar**
- `tests/mocks/auth.ts`
- Qualquer teste em `tests/` que mocke ou importe `SessionService`

**What:**
1. Deletar `src/infra/services/SessionService.ts` após confirmar ausência de imports restantes (busca com grep por `@/infra/services/SessionService`).
2. Em `tests/mocks/auth.ts`: adicionar helper `buildAuthenticatedUser(overrides?)` que retorna `UsuarioAutenticado` com `AUTH_TEST_UUIDS`.
3. Atualizar qualquer mock `vi.mock("@/infra/services/SessionService")` para `vi.mock("@/infra/services/autenticacao/AutenticacaoServico")`.
4. Atualizar testes de actions que simulem `sessionService.requireUser()` para mockar `container.autenticacaoServico.obterUsuario()`.

**Testing:**
```bash
pnpm vitest run        # zero falhas
grep -r "SessionService" src/  # zero resultados
pnpm build             # zero erros de tipagem
```

---

## Checklist Final

- [ ] `InactiveUserError` e `UnauthenticatedError` definidos apenas em `core/abstraction/errors/auth.ts`
- [ ] `UsuarioAutenticado` e `SessaoAutenticada` definidos em `IAutenticacaoServico.ts`
- [ ] `IOrganizacaoRepositorio.buscarPorId()` definido e implementado
- [ ] `AutenticacaoServico` recebe `IOrganizacaoRepositorio` via construtor
- [ ] `obterOrganizacao()` usa repositório real (não mais "Org" hardcoded)
- [ ] `container.autenticacaoServico` exposto para uso nas actions
- [ ] Nenhum import de `@/infra/services/SessionService` no código fonte
- [ ] Todos os testes passando sem regressões
