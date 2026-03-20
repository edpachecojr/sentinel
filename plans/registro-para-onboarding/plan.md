# Revisar Fluxo de Registro -> Onboarding

**Branch:** `feat/registro-para-onboarding`
**Description:** Corrigir e completar o fluxo registro -> onboarding -> dashboard para funcionar end-to-end.

## Goal

Garantir que apos o registro um usuario seja autenticado, redirecionado para o onboarding e, ao conclui-lo, encaminhado para o dashboard. O fluxo possui 3 quebras: o plugin `nextCookies()` ausente impede o cookie de sessao de ser propagado pos-registro via server action; os imports da pagina de onboarding apontam para caminhos inexistentes; e nao ha redirect automatico para `/dashboard` apos o onboarding ser concluido.

## Implementation Steps

### Step 1: Adicionar plugin `nextCookies()` ao auth e limpar propagacao manual de cookie

**Files:**
- `src/infrastructure/lib/auth.ts`
- `src/infrastructure/services/autenticacao/AutenticacaoServico.ts`

**What:** O `AutenticacaoServico.registrar()` ja chama `auth.api.signUpEmail({ headers: await headers() })` corretamente. O problema e que o plugin `nextCookies()` nao esta configurado em `auth.ts` -- sem ele, o better-auth nao consegue propagar o header `Set-Cookie` de volta ao browser quando chamado dentro de uma server action. Adicionar `nextCookies()` como **ultimo** plugin no array `plugins` do `auth.ts` resolve isso de forma transparente para todas as camadas acima.

Ao mesmo tempo, remover o codigo de propagacao manual de cookie do metodo `autenticar()` em `AutenticacaoServico.ts` (a logica que parseia manualmente o header `set-cookie` e chama `cookieStore.set()`) -- com `nextCookies()` ativo, esse workaround se torna redundante e incorreto. Simplificar `autenticar()` para usar `asResponse: false` e retornar diretamente, analogamente a como `registrar()` ja faz.

**Testing:** Registrar um novo usuario via formulario e verificar: (1) usuario criado no banco, (2) cookie de sessao presente nos cookies do browser (DevTools > Application > Cookies), (3) redirect para `/onboarding` ocorre sem ser kickado para `/login`.

---

### Step 2: Corrigir imports da pagina de onboarding e adicionar redirect pos-conclusao

**Files:**
- `src/app/(onboarding)/onboarding/page.tsx`
- `src/app/_actions/onboarding/complete.ts`

**What:** Dois ajustes nesta etapa:

1. **Corrigir import paths**: A pagina de onboarding importa de `@/actions/onboarding/complete` e `@/actions/authAction` -- ambos caminhos inexistentes que causariam `Module not found` em runtime. Os caminhos corretos sao `@/app/_actions/onboarding/complete` e `@/app/_actions/authAction`.

2. **Adicionar redirect pos-onboarding**: A action `completeOnboarding` conclui a transacao no banco mas nao redireciona. Adicionar `redirect("/dashboard")` (de `next/navigation`) ao final da action para fechar o fluxo.

**Testing:** Completar o formulario de onboarding e verificar: (1) `displayName` e `organizacaoId` persistidos no banco, (2) `onboardingCompleted = true` no usuario, (3) browser redireciona automaticamente para `/dashboard`.
