# Formatação de Dados na Camada de Serviço

**Branch:** `refactor/formatacao-camada-servico`
**Description:** Estabelecer o padrão arquitetural onde toda conversão de dado (moeda, data, etc.) ocorre na camada core/serviço, e a camada de apresentação recebe apenas strings prontas para exibição.

## Goal

A camada de apresentação (actions, components, pages) não deve conhecer lógica de formatação de dados. Handlers e serviços do core retornam ViewModels com campos já convertidos para string, garantindo separação de responsabilidade, melhor performance (sem Intl no bundle do cliente) e consistência de exibição em todo o sistema.

## Contexto da Pesquisa

A pesquisa revelou que o projeto está na fase preventiva — nenhuma feature de domínio (Fretes, Veículos, Abastecimento) tem UI ainda. Este é o momento certo para estabelecer o padrão antes que cada dev o viole de forma diferente.

**Problemas adicionais encontrados na revisão geral:**
1. `obterSessao()` mapeia `session.user.name` para o campo `displayName` sem checar o campo `displayName` customizado do better-auth — pode mascarar o nome real após o onboarding.
2. `sairAction` e `completeOnboarding` declaram `{ success: true }` como retorno mas chamam `redirect()` antes — o ramo `success: true` é inalcançável e o tipo de retorno é enganoso.
3. O docstring em `src/utils/data.ts` sugere formatar datas dentro de RSC (padrão errado).

---

## Implementation Steps

### Step 1: Criar utilitário `formatBRL` em `src/utils/moeda.ts`

**Files:**
- `src/utils/moeda.ts` ← criar
- `tests/utils/moeda.test.ts` ← criar

**What:**
Criar o único ponto de entrada para formatação de valores monetários em BRL. A função `formatBRL(value: number | Prisma.Decimal): string` deve usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` e tratar `Prisma.Decimal` convertendo para `number` via `.toNumber()`. Criando aqui em `utils/` (não em `infra/`), fica disponível para handlers do core sem criar dependência circular.

**Testing:**
- `formatBRL(1500)` → `"R$ 1.500,00"`
- `formatBRL(0.5)` → `"R$ 0,50"`
- `formatBRL(new Decimal("1234.56"))` → `"R$ 1.234,56"`
- Valor negativo → string com sinal negativo
- Executar `pnpm vitest run tests/utils/moeda.test.ts`

---

### Step 2: Definir interface `IViewModel` e convenção de ViewModels

**Files:**
- `src/core/abstraction/viewModels/IViewModel.ts` ← criar
- `src/core/abstraction/viewModels/index.ts` ← criar (apenas exporta `IViewModel` — exceção permitida para abstrações core)

**What:**
Criar o tipo base `IViewModel` e documentar onde ViewModels de cada domínio devem viver. A convenção:
- ViewModels ficam em `src/core/casosDeUso/{dominio}/viewModels/{NomeViewModel}.ts`
- Campos formatados têm sufixo `Formatado`: `valorFormatado: string`, `dataFormatada: string`
- O handler retorna sempre o ViewModel, nunca o objeto Prisma bruto

```typescript
// Exemplo da interface base (não obrigatória, mas guia o contrato)
export interface IViewModel {
  readonly _type: string; // discriminator para facilitar type narrowing
}
```

> **Nota:** Neste passo NÃO criar ViewModels concretos de domínio (Frete, Veiculo, etc.) — apenas a abstração base e a convenção documentada. Os ViewModels concretos serão criados junto com cada feature de domínio.

**Testing:**
- Verificar que `src/core/abstraction/viewModels/IViewModel.ts` compila sem erros: `pnpm tsc --noEmit`

---

### Step 3: Atualizar AGENTS.md com a regra de formatação

**Files:**
- `AGENTS.md` ← atualizar

**What:**
Adicionar uma seção nova "## 16. Regra de Formatação de Dados" em `AGENTS.md` documentando:

1. **Onde formatar:** Sempre nos handlers/serviços do core, nunca na apresentação.
2. **O quê formatar:** Datas (`formatDate`, `formatDateTime` de `@/utils/data`), moeda (`formatBRL` de `@/utils/moeda`), CPF (`formatCPF` se implementado).
3. **Como estruturar:** Handler retorna ViewModel com campos `*Formatado`.
4. **O que é proibido na apresentação:** Uso de `Intl.`, `toLocaleString()`, `toFixed()`, `Number()` para exibição, imports de `@/utils/data` ou `@/utils/moeda` em componentes, pages ou actions.
5. **Diagrama atualizado:** Atualizar o diagrama de fluxo de dados na seção 3 para mostrar que dados formatados fluem do handler para a apresentação.

**Padrão a documentar:**
```typescript
// ✅ CORRETO — handler formata antes de retornar
class ListarFretesHandler {
  async executar(organizacaoId: string): Promise<FreteListViewModel[]> {
    const fretes = await this.repo.listar(organizacaoId);
    return fretes.map(f => ({
      id: f.id,
      origem: f.origem,
      destino: f.destino,
      valorFormatado: formatBRL(f.valor),      // ← formatação aqui
      dataFormatada: formatDate(f.data),        // ← formatação aqui
      distanciaKm: f.distanciaKm,              // número puro — UI usa como quiser
    }));
  }
}

// ❌ ERRADO — RSC formatando dado
// const fretes = await db.frete.findMany(...);
// const valorFormatado = new Intl.NumberFormat('pt-BR', ...).format(frete.valor); // NUNCA
```

**Testing:**
- Revisão humana do AGENTS.md para confirmar clareza e consistência com o restante da documentação.

---

### Step 4: Corrigir docstring enganoso em `src/utils/data.ts`

**Files:**
- `src/utils/data.ts` ← atualizar docstring

**What:**
O docstring atual contém o exemplo "Example - Server Component serialization" que mostra formatar datas DENTRO de uma RSC (padrão errado). Remover esse exemplo e substituir por um exemplo correto, mostrando que a formatação pertence ao handler, não à page.

**Antes (errado):**
```
// When fetching dates from Prisma in RSC, format before passing to client:
const fretes = await db.frete.findMany({ where: { organizacaoId } });
return fretes.map(f => ({
  ...f,
  data: formatDate(f.data),      // → "15/01/2024"
  criadoEm: formatDateTime(f.criadoEm),
}));
```

**Depois (correto):**
```
// Use in handlers/services — never in pages, actions, or components:
// ✅ CORRETO: handler formata e retorna ViewModel
// const dataFormatada = formatDate(frete.data); // → "15/01/2024"
//
// ❌ ERRADO: formatar na RSC/page
// const data = formatDate(dbFrete.data); // não faça isso em page.tsx
```

**Testing:**
- `pnpm tsc --noEmit` sem erros
- Revisão humana do docstring

---

### Step 5: Corrigir bugs encontrados na revisão geral

**Files:**
- `src/infra/services/autenticacao/AutenticacaoServico.ts` ← corrigir mapeamento displayName
- `src/app/_actions/auth/sair.ts` ← corrigir tipo de retorno
- `src/app/_actions/onboarding/concluirOnboarding.ts` ← corrigir tipo de retorno

**What:**

**5a. Mapeamento `displayName` em `obterSessao()`:**
O `AutenticacaoServico` mapeia `session.user.name` para o campo `displayName`, ignorando que o better-auth tem um campo `displayName` customizado que pode ter um valor diferente. O mapeamento correto é: `displayName: session.user.displayName ?? session.user.name`.

**5b. Tipo de retorno enganoso em `sairAction` e `completeOnboarding`:**
Ambas as actions declaram `EstadoSair = { success: true } | { success: false; error }` mas chamam `redirect()` antes de qualquer `return { success: true }`, tornando esse ramo inalcançável. O tipo de retorno deve refletir que a função sempre redireciona em caso de sucesso — usar `Promise<{ success: false; error: string }>` ou `never` para o caminho de sucesso, ou simplificar o padrão.

**Opção recomendada:** remover o ramo `{ success: true }` dos tipos e deixar a função retornar `{ success: false; error: string }` apenas — o redirect já comunica sucesso para o Next.js internamente.

**Testing:**
- `pnpm vitest run` — todos os testes passando
- `pnpm tsc --noEmit` — sem erros de tipo
- `pnpm lint` — sem avisos

---

## Validation Final

Após todos os commits:

```bash
pnpm tsc --noEmit      # Sem erros de TypeScript
pnpm vitest run        # Todos os testes passando (incluindo moeda.test.ts)
pnpm lint              # Sem violações de lint
pnpm build             # Build de produção bem-sucedido
```

**Critério de sucesso:**
- `formatBRL` existe e tem 100% de cobertura de testes
- `IViewModel` existe em `src/core/abstraction/viewModels/`
- AGENTS.md tem seção "16. Regra de Formatação de Dados" clara e exemplificada
- O docstring em `data.ts` não sugere mais formatar na RSC
- Bugs de `obterSessao()` e de tipos de retorno corrigidos

## Referências

- [AGENTS.md](../../AGENTS.md) — diretrizes de arquitetura do projeto
- [src/utils/data.ts](../../src/utils/data.ts) — utilitários de data existentes
- [src/core/abstraction/](../../src/core/abstraction/) — interfaces de abstração do core
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — API de formatação nativa
