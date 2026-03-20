# Polimento Visual — Transições, Loading States e Confirmações

**Branch:** `feat/polimento-visual-ui`
**Description:** Adicionar animações ao modal, spinner nativo ao Button, modal de confirmação de logout, loading de rota e pequenos ajustes visuais finais — tudo restrito ao diretório `src/app`.

## Goal

A navegação atual tem gaps de UX importantes: o `Modal` aparece e desaparece abruptamente (sem nenhuma animação), o `Button` não tem spinner nativo (obrigando cada consumidor a alterar o texto manualmente), o logout acontece sem confirmação e não há loading visual entre trocas de rota na área privada. Este plano resolve cada um desses gaps de forma incremental, usando apenas `tw-animate-css` (já instalado) e Tailwind — sem adicionar novas dependências.

---

## Contexto Técnico

| Item | Estado atual | Problema |
|---|---|---|
| `modal/index.tsx` | `if (!isOpen) return null` | Mount/unmount abrupto — zero animação |
| `Button.tsx` | Sem `loading` prop | Spinner manual em cada consumer |
| `UserDropdown.tsx` | `sairAction()` chamado diretamente | Logout imediato, sem confirmação |
| `(private)/loading.tsx` | Não existe | Troca de rota sem feedback visual |
| `layout.tsx` | `lang="en"` | Locale incorreto |
| `dashboard/page.tsx` | Conteúdo placeholder, sem entrada animada | `animate-fade-in-up` definida mas nunca usada |
| `Backdrop.tsx` | Sem transição de opacidade | Backdrop do sidebar mobile aparece abruptamente |

**Bibliotecas disponíveis (sem instalar nada novo):**
- `tw-animate-css` — classes `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-*`, `animate-out`, `fade-out`, `zoom-out-95`
- `sonner` — toasts já configurados
- `@radix-ui/*` — instalado via shadcn; primitivos de dialog podem ser explorados se necessário

---

## Implementation Steps

### Step 1: Animar Modal + adicionar prop `loading` ao Button

**Files:**
- `src/app/_components/ui/modal/index.tsx`
- `src/app/_components/ui/button/Button.tsx`

**What:**

**Modal:** Substituir o padrão `if (!isOpen) return null` por um padrão de mount controlado com CSS transitions. O modal permanecerá montado no DOM durante a transição de saída. Usar `tw-animate-css` para fade + zoom no overlay e no card:
- Overlay: `animate-in fade-in duration-200` na abertura / `animate-out fade-out duration-200` no fechamento
- Card: `animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300` / `animate-out fade-out zoom-out-95 slide-out-to-bottom-4 duration-200`
- Implementar com `data-[state=open]` / `data-[state=closed]` ou com estado `isVisible` + `isAnimatingOut` para controlar o unmount pós-animação.

**Button:** Adicionar prop `loading?: boolean`. Quando `loading={true}`:
- Exibir spinner SVG à esquerda do `children` (SVG inline com `animate-spin`)
- Aplicar `disabled` automaticamente
- Isso elimina a necessidade de cada formulário trocar o texto manualmente

**Testing:** Abrir qualquer modal no app e verificar fade + zoom suave; clicar em botão com `loading={true}` e verificar spinner + desabilitado.

---

### Step 2: Conectar spinner nos formulários e no onboarding

**Files:**
- `src/app/_components/auth/LoginForm.tsx`
- `src/app/_components/auth/RegisterForm.tsx`
- `src/app/_components/onboarding/OnboardingContainer.tsx`

**What:**

Atualmente os três formulários comunicam loading apenas alterando o texto do botão (`"Entrando..."`, `"Criando conta..."`, `"Concluindo..."`). Com a nova prop `loading` do Button, cada formulário:
- Passa `loading={isPending}` para o `<Button>`
- Remove a lógica de texto condicional do `children` do botão, voltando para o texto fixo (ex: `"Entrar"`, `"Criar conta"`, `"Concluir"`)
- O spinner aparece automaticamente e os campos permanecem com `disabled={isPending}` como já estão

**Testing:** Submeter cada formulário e confirmar que um spinner aparece no botão enquanto a action processa, sem alterar texto.

---

### Step 3: Modal de confirmação de logout

**Files:**
- `src/app/_components/header/UserDropdown.tsx`

**What:**

Atualmente `sairAction()` é chamada diretamente ao clicar em "Sair". Adicionar um modal de confirmação inline usando o `Modal` já existente (agora animado após o Step 1):
- Estado local `isLogoutModalOpen` controlado por `useState`
- Clicar em "Sair" no dropdown abre o modal em vez de executar a action
- O modal exibe: título "Sair da conta?", mensagem amigável e dois botões: "Cancelar" (fecha modal) e "Confirmar saída" (chama `sairAction()` via startTransition)
- `"Confirmar saída"` usa `loading={isPending}` para mostrar spinner durante o redirect

**Testing:** Clicar em "Sair" no header → modal aparece com animação → "Cancelar" fecha o modal → "Confirmar saída" exibe spinner e redireciona para login.

---

### Step 4: Loading de rota, polimentos finais e correção de locale

**Files:**
- `src/app/(private)/loading.tsx` ← **criar**
- `src/app/(private)/dashboard/page.tsx`
- `src/app/_components/layout/Backdrop.tsx`
- `src/app/layout.tsx`

**What:**

**`(private)/loading.tsx` (novo):** Criar página de loading que o Next.js exibe automaticamente durante navegação entre rotas do grupo `(private)`. Layout: spinner centralizado + esqueleto sutil de linha, usando as cores do tema (dark/light via CSS vars). Usar `animate-in fade-in duration-300` para a própria entrada do loading.

**`dashboard/page.tsx`:** Envolver o conteúdo em um `<div className="animate-fade-in-up">` para aproveitar a keyframe customizada já definida em `globals.css` (atualmente definida mas nunca usada em nenhum componente visível).

**`Backdrop.tsx`:** Adicionar `transition-opacity duration-300` + `opacity-0`/`opacity-100` baseado no estado `isOpen` do sidebar, em vez de aparecer/desaparecer abruptamente. Isso polide a experiência mobile.

**`layout.tsx`:** Corrigir `lang="en"` para `lang="pt-BR"` no elemento `<html>`. Correção de acessibilidade e locale.

**Testing:**
- Navegar entre rotas dentro de `/` (private) e observar o loading visual antes do conteúdo aparecer
- Dashboard deve entrar com animação `fade-in-up`
- No mobile, abrir e fechar sidebar e verificar que o backdrop faz transição suave de opacidade
- Inspecionar o HTML e confirmar `<html lang="pt-BR">`
