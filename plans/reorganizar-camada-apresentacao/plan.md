# Reorganizar Camada de Apresentação para `src/app/`

**Branch:** `refactor/reorganizar-camada-apresentacao`
**Description:** Mover todos os artefatos de apresentação (actions, components, hooks, context, icons, schemas de formulário) para dentro de `src/app/`, usando prefixo `_` nas pastas para não criar rotas, evidenciando a separação arquitetural em camadas.

## Goal

Alinhar a estrutura de diretórios à arquitetura de três camadas definida no AGENTS.md: `src/app/` como Camada de Apresentação exclusiva, `src/services/` e `src/schemas/` como Core, e `src/repositories/` + `src/lib/` como Infraestrutura. Hoje arquivos de apresentação vivem misturados ao nível do `src/`, diluindo a clareza das fronteiras entre camadas.

## Estrutura Final Alvo

```
src/
├── app/                          ← APRESENTAÇÃO (tudo de UI vive aqui)
│   ├── _actions/                 ← server actions
│   │   ├── authAction.ts
│   │   ├── onboarding/complete.ts
│   │   ├── organizations/
│   │   │   ├── create.ts
│   │   │   └── getOrganizationName.ts
│   │   └── users/completeOnboarding.ts
│   ├── _components/              ← componentes React
│   │   ├── auth/
│   │   ├── common/
│   │   ├── form/
│   │   ├── header/
│   │   ├── layout/               ← shell: AppHeader, AppSidebar, Backdrop
│   │   ├── onboarding/
│   │   ├── tables/
│   │   ├── ui/
│   │   └── user-profile/
│   ├── _context/                 ← React Context providers
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   ├── _hooks/                   ← React hooks de UI
│   │   ├── useGoBack.ts
│   │   └── useModal.ts
│   ├── _icons/                   ← SVGs como componentes React (sem barrel)
│   │   └── *.svg (imports diretos)
│   ├── _schemas/                 ← schemas Zod de validação de formulários
│   │   ├── loginSchema.ts
│   │   └── registerSchema.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   ├── (landing)/
│   ├── (onboarding)/
│   ├── (private)/
│   └── api/
│
├── lib/                          ← INFRAESTRUTURA (auth, db, logger, utils.ts)
├── repositories/                 ← INFRAESTRUTURA (acesso a dados)
├── services/                     ← CORE (lógica de negócio)
├── schemas/                      ← CORE (schemas Zod de domínio)
│   ├── organizacaoSchema.ts      ← vem de utils/validations/organization.ts
│   └── usuarioSchema.ts          ← vem de utils/validations/user.ts
├── types/                        ← CORE (tipos de domínio)
├── utils/                        ← utilitários compartilhados
│   ├── uuid.ts
│   └── cpf.ts                    ← vem de utils/validations/cpf.ts
└── proxy.ts                      ← middleware Next.js (permanece na raiz de src/)
```

---

## Implementation Steps

### Step 1: Reorganizar schemas — domínio para `src/schemas/`, formulários para `src/app/_schemas/`

**Files:**
- `src/utils/validations/organization.ts` → `src/schemas/organizacaoSchema.ts`
- `src/utils/validations/user.ts` → `src/schemas/usuarioSchema.ts`
- `src/utils/validations/cpf.ts` → `src/utils/cpf.ts`
- `src/schemas/loginSchema.ts` → `src/app/_schemas/loginSchema.ts`
- `src/schemas/registerSchema.ts` → `src/app/_schemas/registerSchema.ts`
- `src/services/organizations/create.ts` — atualizar import
- `src/services/users/completeOnboarding.ts` — atualizar import
- `src/components/auth/LoginForm.tsx` — atualizar import
- `src/components/auth/RegisterForm.tsx` — atualizar import
- `src/components/onboarding/OnboardingContainer.tsx` — extrair schemas inline para `src/app/_schemas/`

**What:** Separa os schemas Zod entre Apresentação (`src/app/_schemas/` — formulários de UI, sem regra de negócio) e Core (`src/schemas/` — schemas de domínio usados pelos services). Move o validador de CPF (algoritmo puro, sem Zod) para `src/utils/cpf.ts`. Remove o diretório `src/utils/validations/` que hoje mistura responsabilidades.

**Testing:**
- `pnpm build` sem erros de módulo não encontrado
- `pnpm vitest run` — todos os testes passando
- Inspecionar manualmente: `src/schemas/` contém apenas schemas de domínio; `src/app/_schemas/` contém apenas schemas de form

---

### Step 2: Mover hooks, context e icons para `src/app/`

**Files:**
- `src/hooks/useEventForm.ts` → **REMOVER** (código órfão de outro projeto; importa `@/types/appointment` inexistente)
- `src/hooks/useGoBack.ts` → `src/app/_hooks/useGoBack.ts`
- `src/hooks/useModal.ts` → `src/app/_hooks/useModal.ts`
- `src/context/SidebarContext.tsx` → `src/app/_context/SidebarContext.tsx`
- `src/context/ThemeContext.tsx` → `src/app/_context/ThemeContext.tsx`
- `src/icons/*.svg` → `src/app/_icons/*.svg`
- `src/icons/index.tsx` → **REMOVER** o barrel; atualizar todos os imports para apontar diretamente ao arquivo SVG
- `src/layout/AppSidebar.tsx` — atualizar imports de context e icons (hoje usa paths relativos `../context/` e `../icons/`)
- `src/layout/AppHeader.tsx` — atualizar import de context
- `src/app/(private)/layout.tsx` — atualizar import de context
- `src/app/(onboarding)/layout.tsx` — atualizar imports se necessário

**What:** Consolida hooks de UI, providers de estado global e ícones SVG dentro de `src/app/`. Remove o barrel `src/icons/index.tsx` (viola regra do AGENTS.md de não usar re-exports) e converte cada uso para import direto do SVG correspondente. Remove `useEventForm.ts` por ser código legado órfão.

**Testing:**
- `pnpm build` sem erros
- Validar visualmente: sidebar expande/recolhe, tema claro/escuro alterna, dropdowns de header funcionam
- `pnpm vitest run`

---

### Step 3: Mover components e layout shell para `src/app/_components/`

**Files:**
- `src/components/auth/` → `src/app/_components/auth/`
- `src/components/common/` → `src/app/_components/common/`
- `src/components/form/` → `src/app/_components/form/`
- `src/components/header/` → `src/app/_components/header/`
- `src/components/onboarding/` → `src/app/_components/onboarding/`
- `src/components/tables/` → `src/app/_components/tables/`
- `src/components/ui/` → `src/app/_components/ui/`
- `src/components/user-profile/` → `src/app/_components/user-profile/`
- `src/layout/AppHeader.tsx` → `src/app/_components/layout/AppHeader.tsx`
- `src/layout/AppSidebar.tsx` → `src/app/_components/layout/AppSidebar.tsx`
- `src/layout/Backdrop.tsx` → `src/app/_components/layout/Backdrop.tsx`
- `src/app/(auth)/layout.tsx` — atualizar imports de componentes auth
- `src/app/(onboarding)/layout.tsx` — atualizar imports de componentes onboarding
- `src/app/(private)/layout.tsx` — atualizar imports de AppSidebar, AppHeader, Backdrop
- `src/app/(private)/dashboard/page.tsx` — atualizar imports se necessário
- `src/app/layout.tsx` — atualizar imports globais (Sonner, etc.)
- Todos os arquivos que importam de `@/components/*` ou `@/layout/*`

**What:** Move toda a camada de componentes React e o shell operacional da aplicação (AppHeader, AppSidebar, Backdrop) para dentro de `src/app/_components/`. Os componentes de layout do shell ficam em `src/app/_components/layout/`, agrupados com os demais componentes. Remove os diretórios `src/components/` e `src/layout/` tornando a camada de apresentação auto-contida em `src/app/`.

**Testing:**
- `pnpm build` sem erros
- `pnpm vitest run`
- Testar no browser: login, register, dashboard carregam corretamente; sidebar e header renderizam

---

### Step 4: Mover server actions para `src/app/_actions/`

**Files:**
- `src/actions/authAction.ts` → `src/app/_actions/authAction.ts`
- `src/actions/onboarding/complete.ts` → `src/app/_actions/onboarding/complete.ts`
- `src/actions/organizations/create.ts` → `src/app/_actions/organizations/create.ts`
- `src/actions/organizations/getOrganizationName.ts` → `src/app/_actions/organizations/getOrganizationName.ts`
- `src/actions/users/completeOnboarding.ts` → `src/app/_actions/users/completeOnboarding.ts`
- `src/actions/auth/` → **REMOVER** (diretório completamente vazio)
- `src/app/_components/layout/AppSidebar.tsx` — atualizar import de `getOrganizationName`
- `src/app/(onboarding)/onboarding/page.tsx` — atualizar imports de actions
- `src/app/(auth)/login/page.tsx` — atualizar imports se necessário
- `src/app/(auth)/register/page.tsx` — atualizar imports se necessário
- Todos os arquivos que importam de `@/actions/*`

**What:** Move os server actions (funções `"use server"` da camada de apresentação) para dentro de `src/app/_actions/`. Remove o subdiretório vazio `src/actions/auth/`. Após este passo, `src/actions/` pode ser completamente removido, completando a migração de toda a camada de apresentação para `src/app/`.

**Testing:**
- `pnpm build` sem erros
- `pnpm vitest run`
- Testar fluxo completo: criar conta → onboarding → dashboard

---

### Step 5: Limpeza final e validação de build

**Files:**
- Remover diretórios agora vazios: `src/actions/`, `src/components/`, `src/hooks/`, `src/context/`, `src/icons/`, `src/layout/`, `src/schemas/` (se vazio)
- `src/components/ui/tooltip.tsx` — arquivo duplicado (também existe `ui/tooltip/Tooltip.tsx`); remover o arquivo solto
- Verificar `src/utils/` — remover `src/utils/validations/` após confirmação que está vazio
- Varredura final por imports quebrados: `grep -r "from '@/actions" src/` (deve retornar zero resultados)
- Varredura por imports apontando para locais antigos: `@/components`, `@/hooks`, `@/context`, `@/icons`, `@/layout`

**What:** Remove todos os diretórios vazios que sobraram após a migração e verifica que nenhum import ainda aponta para os locais antigos. Executa build de produção completo para garantir que a reorganização não introduziu nenhuma regressão.

**Testing:**
- `pnpm lint` — zero erros
- `pnpm build` — build completo de produção com sucesso
- `pnpm vitest run` — todos os testes passando
- Varredura de imports antigos deve retornar zero resultados

---

## Observações Técnicas

### Path aliases (`tsconfig.json`)
O alias `@/*` já mapeia para `src/*`, então os novos caminhos (`@/app/_components/*`, `@/app/_actions/*`, etc.) funcionam automaticamente sem alterações no `tsconfig.json`.

### Arquivos que permanecem fora de `src/app/`
| Arquivo/Pasta | Motivo |
|---|---|
| `src/lib/` | Infraestrutura (auth, db, logger, `cn()` do shadcn/ui) |
| `src/services/` | Core — lógica de negócio |
| `src/repositories/` | Infraestrutura — acesso a dados |
| `src/schemas/` | Core — schemas Zod de domínio |
| `src/types/` | Core — tipos de domínio TypeScript |
| `src/utils/uuid.ts` + `cpf.ts` | Utilitários compartilhados (sem UI) |
| `src/proxy.ts` | Middleware do Next.js — deve ficar na raiz de `src/` |

### Atenção: imports relativos no AppSidebar
`src/layout/AppSidebar.tsx` hoje usa paths relativos `../context/SidebarContext` e `../icons/index` em vez de aliases `@/`. No Step 2 e Step 3, ao mover o arquivo e seus destinos, corrigir para usar `@/app/_context/SidebarContext` e imports diretos de `@/app/_icons/*.svg`.

### Barrel de icons
O barrel `src/icons/index.tsx` exporta ~50 SVGs, e `AppSidebar.tsx` é o principal consumidor. Ao remover o barrel (violação do AGENTS.md), inspecionar cada SVG usado no AppSidebar e nos demais componentes e substituir por imports diretos individuais.
