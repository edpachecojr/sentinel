# Revisar Utils e Mover dateTimeService

**Branch:** `revisar-utils-e-dateservice`
**Description:** Move `dateTimeService.ts` da camada de infraestrutura para `src/utils/`, adiciona testes ausentes para funções de data e CPF, e revisa a coerência dos demais utilitários (`slug`, `uuid`, `cpf`).

## Goal

`dateTimeService.ts` está em `src/infra/services/` mas é composto exclusivamente de funções puras sem nenhuma dependência de infraestrutura (sem Prisma, sem `auth`, sem `next/headers`). Isso viola o princípio de camadas do projeto — funções utilitárias pertencem a `src/utils/`. Além disso, `cpf.ts` e `dateTimeService.ts` carecem de cobertura de testes, e nenhum deles está sendo importado por nenhum arquivo do projeto ainda.

---

## Contexto Técnico Relevante

### Estado atual dos utils

| Arquivo | Localização atual | Usages no projeto | Testes |
|---|---|---|---|
| `dateTimeService.ts` | `src/infra/services/` ← **errado** | 0 imports (nunca usado) | ❌ nenhum |
| `cpf.ts` | `src/utils/` ✅ | 0 imports (nunca usado) | ❌ nenhum |
| `slug.ts` | `src/utils/` ✅ | Usado em `concluirOnboardingHandler` | ✅ `tests/utils/slug.test.ts` |
| `uuid.ts` | `src/utils/` ✅ | Usado em handlers e repositórios | ⚠️ sem testes unitários explícitos |
| `utils.ts` (cn) | `src/app/_lib/` ✅ | Usado em componentes Tailwind | ⚠️ sem testes (trivial) |

### Funções exportadas por `dateTimeService.ts`
```
getNow(): Date
isValidDate(date: Date | unknown): boolean
parsePlainIsoDate(value: string): Date   ← YYYY-MM-DD → UTC noon (evita off-by-one timezone)
parseDate(value: unknown): Date | null   ← aceita Date, ISO string, DD/MM/YYYY
formatDate(value): string                ← DD/MM/YYYY (pt-BR, America/Sao_Paulo)
formatDateTime(value): string           ← DD/MM/YYYY HH:MM (pt-BR)
```

---

## Implementation Steps

### Step 1: Mover `dateTimeService.ts` → `src/utils/data.ts`

**Files:**
- `src/utils/data.ts` ← **criar** (conteúdo idêntico ao de `dateTimeService.ts`)
- `src/infra/services/dateTimeService.ts` ← **deletar**

**What:**
1. Criar `src/utils/data.ts` com o conteúdo exato de `dateTimeService.ts` — sem alterações de lógica.
2. Confirmar que nenhum arquivo importa `dateTimeService` (busca por `from "@/infra/services/dateTimeService"`) — confirmado: zero ocorrências no projeto.
3. Deletar `src/infra/services/dateTimeService.ts`.

**Nota de nomenclatura:** `data.ts` segue a convenção pt-BR (`data` significa "date/datum" em português). Exporta funções, não uma classe — sem sufixo `Service`.

**Testing:** `pnpm tsc --noEmit` deve continuar sem erros. `pnpm vitest run` sem regressões.

---

### Step 2: Adicionar testes para `src/utils/data.ts`

**Files:**
- `tests/utils/data.test.ts` ← **criar**

**What:**
Cobertura de testes para todas as funções exportadas de `data.ts`:

| Função | Casos de teste |
|---|---|
| `isValidDate` | Date válido → true; string → false; null → false; undefined → false |
| `parsePlainIsoDate` | "2024-01-15" → UTC noon (12:00:00Z); string inválida → lança erro |
| `parseDate` | Date object → retorna mesmo Date; ISO string → Date; "DD/MM/YYYY" → Date; valor inválido → null |
| `formatDate` | Date válido → "15/01/2024" (pt-BR); null → string vazia; undefined → string vazia |
| `formatDateTime` | Date válido → "15/01/2024 10:30" (horário BRT); null → string vazia |
| `getNow` | Retorna instância de Date |

**Exemplo de estrutura:**
```typescript
import { describe, it, expect } from "vitest";
import { parsePlainIsoDate, formatDate, parseDate, isValidDate } from "@/utils/data";

describe("parsePlainIsoDate()", () => {
  it("converte YYYY-MM-DD para UTC noon para evitar off-by-one de timezone", () => {
    const result = parsePlainIsoDate("2024-01-15");
    expect(result.toISOString()).toBe("2024-01-15T12:00:00.000Z");
  });
});

describe("formatDate()", () => {
  it("formata como DD/MM/YYYY em pt-BR", () => {
    const result = formatDate(new Date("2024-01-15T12:00:00.000Z"));
    expect(result).toBe("15/01/2024");
  });

  it("retorna string vazia para null", () => {
    expect(formatDate(null)).toBe("");
  });
});
```

**Testing:** `pnpm vitest run tests/utils/data.test.ts` deve passar com todos os casos verde.

---

### Step 3: Adicionar testes para `src/utils/cpf.ts`

**Files:**
- `tests/utils/cpf.test.ts` ← **criar**

**What:**
Cobertura de testes para `validateCPF`:

| Caso | Entrada | Esperado |
|---|---|---|
| CPF válido formatado | "000.000.000-00" | false (CPF com todos dígitos iguais → inválido por regra) |
| CPF válido real | "11144477735" (dígitos verificadores corretos) | true |
| CPF inválido (dígitos errados) | "11111111111" | false |
| CPF muito curto | "123" | false |
| Entrada vazia | "" | false |
| Aceita formatação com pontos e hífen | "111.444.777-35" | true |

> **Nota:** verificar e documentar se `validateCPF` aceita CPF formatado (com pontos/hífen) ou apenas dígitos. O teste deve cobrir ambos os formatos.

**Testing:** `pnpm vitest run tests/utils/cpf.test.ts` deve passar.

---

### Step 4: Revisar e documentar `uuid.ts` e `slug.ts`

**Files:**
- `src/utils/uuid.ts` (somente leitura — sem alteração exceto se necessário)
- `src/utils/slug.ts` (somente leitura — sem alteração exceto se necessário)
- `tests/utils/slug.test.ts` (verificar cobertura existente)

**What:**
1. **`uuid.ts`**: verificar se `generateId()` é o único ponto de geração de IDs no projeto. Buscar por `Math.random()`, `Date.now()`, ou `uuid` importado diretamente nos services/repositories. Se encontrado, consolidar para usar `generateId()`.
2. **`slug.ts`**: verificar testes existentes em `tests/utils/slug.test.ts`:
   - Cobrem acentos? (ex: "Ação" → "acao")
   - Cobrem espaços múltiplos?
   - Cobrem caracteres especiais?
   - Se algum caso relevante estiver faltando, adicionar.

**Testing:** `pnpm vitest run tests/utils/` deve passar com todos os arquivos.

---

### Step 5: Registrar uso esperado de `data.ts` e `cpf.ts` no projeto

**Files:**
- `src/app/_schemas/` — schemas Zod de formulários que lidam com datas ou CPF

**What:**
Os utilitários `data.ts` e `cpf.ts` existem mas não são consumidos. Identificar os schemas Zod existentes que:
1. Aceitam campos de data (ex: data do frete, data de manutenção, data de abastecimento) e não usam `parseDate`/`parsePlainIsoDate` do `data.ts`
2. Poderiam usar `validateCPF` em campos de CPF (ex: dados do motorista)

Para cada caso identificado, adicionar um `.superRefine()` ou `.transform()` no schema Zod usando as funções de `@/utils/data` e `@/utils/cpf`. Isso ativa os utilitários e garante cobertura real no produto.

> **Escopo limitado:** apenas schemas existentes. Não criar novos schemas ou formulários.

**Testing:** `pnpm tsc --noEmit` e `pnpm vitest run` sem regressões. Testes afetados pelos schemas atualizar se necessário.

---

## Checklist Final

- [ ] `src/infra/services/dateTimeService.ts` deletado (zero ocorrências em imports)
- [ ] `src/utils/data.ts` criado com todas as funções de data
- [ ] `tests/utils/data.test.ts` aprovado com cobertura completa das funções
- [ ] `tests/utils/cpf.test.ts` aprovado para `validateCPF`
- [ ] `tests/utils/slug.test.ts` revisado — edge cases de acentos e caracteres especiais cobertos
- [ ] `generateId()` é o único ponto de geração de IDs (sem `uuid` importado diretamente)
- [ ] Pelo menos um schema Zod usando `parseDate` ou `validateCPF`
- [ ] `pnpm vitest run` — zero falhas
- [ ] `pnpm tsc --noEmit` — zero erros
