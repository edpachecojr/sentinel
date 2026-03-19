# Guia de Design System — Cores, Contraste e Hierarquia

> Um guia prático e acionável para padronizar paletas, regras de contraste, tokens e verificações automáticas. Ideal para que um agente de IA consiga revisar um Design System e propor correções.

---

# 1. Objetivo

Este documento define regras e convenções para:

- Paletas de cores (primária, secundária, terciária e neutrals).
- Cores semânticas (sucesso, aviso, erro, informação).
- Cores de superfície, ação e fundo.
- Cores de texto: primário, secundário e desativado.
- Regras de contraste, hierarquia visual e composição de cores.
- Tokens CSS/Design (naming convention) e exemplos de uso.
- Checklist e heurísticas que um agente de IA pode executar para revisar/corrigir automaticamente.

---

# 2. Fundamentos de cor e percepção

- **Hue (matiz):** identifica a família (ex.: vermelho, azul).
- **Saturation (saturação):** intensidade da cor (pura → dessaturada/acinzentada).
- **Lightness / Luminance (luminosidade):** quão claro ou escuro é a cor.
- **Tinta vs Tom vs Sombra:** tintas = mistura com branco (mais claro); sombras = mistura com preto (mais escuro).

**Boas práticas perceptivas:**

- Use contraste alto para elementos interactivos e texto.
- Use saturação moderada para cores de ação; cores muito saturadas cansam a visão.
- Cores semanticamente similares (ex.: sucesso/verde) devem ser discerníveis por tonalidade e luminância.

---

# 3. Paleta base (tokens sugeridos)

> Dica: escolha uma _cor primária_ forte (branding) e derive variações (tint/shade). Em seguida, escolha 1–2 cores secundárias para ênfases e 1 cor terciária neutra ou para estados de destaque.

## 3.1 Exemplo de paleta recomendada (exemplo prático)

- **Primary 500:** #0B5FFF (ação principal)

- **Primary 700:** #0846CC (ação hover / forte)

- **Primary 300:** #8FB6FF (tint / backgrounds leves)

- **Secondary 500:** #FF6B00

- **Secondary 300:** #FFB588

- **Tertiary 500 (accent):** #22C1A7

- **Neutral / Gray scale:**
  - Gray 900 (texto primário): #111216
  - Gray 800: #22232A
  - Gray 700 (texto secundário): #44454B
  - Gray 500 (borders / labels): #9AA0A6
  - Gray 300 (surface low contrast): #E6E9EB
  - Gray 100 (background): #F7F9FA

- **Semantic colors:**
  - Success 500: #1DB954
  - Warning 500: #FFB020
  - Info 500: #1778FF
  - Danger / Error 500: #E5322B

> Observação: esses hex são exemplos. Um Design System real deve ter variações 50/100/200/.../900 para cada cor principal.

---

# 4. Tokens e nomenclatura (convenção)

Use tokens estáveis, previsíveis e legíveis. Exemplo de convenção BEM-like / design tokens:

- `color.{role}.{purpose}.{level}`
  - Ex.: `color.brand.primary.500` ou `color.semantic.error.600`
  - Ex.: `color.text.primary`, `color.text.secondary`, `color.text.disabled`

Tokens primários comuns:

- `color.brand.primary.50` ... `color.brand.primary.900`
- `color.neutral.100` ... `color.neutral.900`
- `color.surface.background` (surface default)
- `color.surface.onBackground` (textos sobre background claro)
- `color.surface.card` (cards)
- `color.action.primary` (botões primários)
- `color.action.primary.on` (texto sobre botão primário)
- `color.state.success`, `color.state.error`, `color.state.warning`, `color.state.info`

Também defina tokens de **elevations** e estados:

- `elevation.surface.level1` (sombras e cor de fundo dos elementos elevados)
- `state.hover.opacity`, `state.disabled.opacity` (reutilizáveis)

---

# 5. Cores para textos

- `color.text.primary` — usada para conteúdo principal (contraste alto). Recomendação WCAG: contraste ≥ 4.5:1 para texto normal (AA). Para grandes (≥18pt ou 14pt bold) contraste ≥ 3:1.
- `color.text.secondary` — informação auxiliar, meta-informação, descricao. Recomenda contraste ≥ 3:1 idealmente.
- `color.text.disabled` — elementos desativados; usar baixa opacidade sobre surface com contraste ≈ 1.5–2:1 mas evitar para texto informativo crítico.

Exemplos:

- Texto primário sobre fundo claro: `#111216` sobre `#FFFFFF` — contraste alto.
- Texto secundário: `#44454B` sobre `#FFFFFF`.

---

# 6. Superfícies, ações e fundos

- **Surface / Superfícies:** cards, modais — geralmente neutras (neutrals 0–200). Use variações sutis (ex.: `neutral.100` para fundo de app, `neutral.0` para fundo branco puro, `neutral.200` para cards).
- **Ações:** botões, links — use `brand.primary` ou `action.primary` com token `on` para texto do botão (ex.: `color.action.primary.on` = branco).
- **Fundo (page background):** `color.background.default` — geralmente uma escala neutra clara (#F7F9FA ou #FFFFFF).

Regras:

- Elementos clicáveis devem ter contraste suficiente com seu fundo (≥3:1 para componentes não-texto, e o texto dentro deve respeitar as regras de texto).
- Elementos elevados podem usar `elevation.surface.levelX` que altera levemente a cor (subtle tint/shade) e adiciona sombra.

---

# 7. Regras de contraste (WCAG 2.1 resumo prático)

- **Texto normal:** mínimo 4.5:1 (WCAG AA)
- **Texto grande (≥18pt regular ou ≥14pt bold):** mínimo 3:1
- **UI components e gráficos:** mínimo 3:1 para perfeita percepção
- **AAA (opcional):** 7:1 para texto normal

## 7.1 Como calcular contraste (fórmula resumida)

1. Converter cada componente RGB em valor linearizado:
   - `sRGB` → `R'`, `G'`, `B'` normalizados entre 0 e 1 (divida hex por 255).
   - Para cada canal:
     - se `c <= 0.03928` então `c = c / 12.92`
     - senão `c = ((c + 0.055) / 1.055) ** 2.4`

2. Calcular luminância relativa `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`.

3. Contraste entre duas cores A e B: `(L1 + 0.05) / (L2 + 0.05)` onde `L1` é luminância maior.

> Um agente de IA deve aplicar essa fórmula para verificar todos os pares relevantes (ex.: `text.primary` vs `background`, `button.text` vs `button.bg`).

---

# 8. Composição e harmonia de cores

Técnicas recomendadas:

- **Monocromática:** usar variações da mesma hue — segura, boa para UIs corporativas.
- **Análoga:** hues próximos (ex.: azul + ciano) — harmonia suave.
- **Complementar:** hues opostos (ex.: azul + laranja) — alto contraste, boa para CTAs.
- **Triádica / Tetrádica:** três/quatro cores equidistantes para paletas vibrantes.
- **Split-complementary:** alternativa ao complementar com menos contraste extremo.

Regras práticas:

- Reserve a cor mais saturada/contrastante para CTA principal.
- Use cores secundárias para acentos, não para conteúdo primário.
- Para fundos, prefira neutrals e use a cor de branding em pequenas doses.

---

# 9. Estratégia para estados e variações

- Para cada cor principal, defina: `50/100/200/.../900` (ou pelo menos 100/300/500/700/900).
- Estados:
  - `hover`: geralmente `-100` (mais escuro) ou aplicar `opacity` sobre camada de destaque.
  - `active`: ainda mais escuro que hover.
  - `focus`: usar outline com contraste visível (ex.: `2px solid color.primary.500` ou `box-shadow` com `3px` e baixa opacidade).
  - `disabled`: reduzir saturação e aplicar `opacity: 0.38` (método material) ou usar `neutral.300`.

---

# 10. Cores de feedback (semânticas)

Definir para cada cor semântica a série completa (50–900) e tokens:

- `color.state.success`, `color.state.success.on` (texto sobre sucesso)
- `color.state.error`, `color.state.error.on`
- `color.state.warning`, `color.state.warning.on`
- `color.state.info`, `color.state.info.on`

Regras:

- Evite usar apenas cor para comunicar estados — inclua ícones/labels (acessibilidade para daltonismo).
- Para banners/alerts, garantir contraste do texto e do ícone.

---

# 11. Paleta de cinzas (neutrals)

Sugestão de escala (exemplo):

- `neutral.100` — #F7F9FA (page bg)
- `neutral.200` — #E6E9EB (card bg)
- `neutral.300` — #D1D6DA (border)
- `neutral.400` — #BABFC5 (muted text)
- `neutral.500` — #9AA0A6 (subtle)
- `neutral.600` — #6E7378 (labels)
- `neutral.700` — #44454B (text secondary)
- `neutral.800` — #22232A (text strong)
- `neutral.900` — #111216 (text primary)

---

# 12. Acessibilidade além do contraste

- **Daltonismo:** teste com simulações (Deuteranopia, Protanopia, Tritanopia). Garanta que informação não dependa só da cor.
- **Leitura e hierarquia:** tamanho do texto, pesos de fonte, espaçamentos e ritmo tipográfico.
- **Foco visível:** todo elemento interativo deve ter estado `:focus` destacável por teclado.
- **Toques e targets:** alvo mínimo 44x44 px para touch.

---

# 13. Heurísticas para um agente de IA revisar o Design System

O agente deve executar verificações automatizadas e propor correções. Checklist sugerido:

1. **Mapear tokens** — listar todos os tokens `color.*` e seus hex.
2. **Validar variações mínimas** — cada role importante (brand, neutral, state) tem ao menos 5 níveis (ex.: 100, 300, 500, 700, 900).
3. **Verificar contraste** — calcular contraste entre texto e fundo para todos os componentes visuais. Flag quando:<br> - texto normal < 4.5:1<br> - texto grande < 3:1<br> - componentes clicáveis < 3:1
4. **Detectar sobreposição de tokens** — cores diferentes com contraste baixo que geram ambiguidade (ex.: `badge.info` ≈ `badge.success`).
5. **Testes de daltonismo** — aplicar transformações de cor para simular e verificar distinção de estados.
6. **Regras de prioridade** — detectar uso indevido de cores _branding_ em áreas sem função (ex.: textos longs), sugerir neutrals.
7. **Sugerir correções automáticas:**
   - Ajustar luminância até atingir contraste mínimo (mantendo hue). Estratégia: converter para HSL, alterar L (lightness) incrementalmente e recalcular contraste.
   - Se saturação for muito baixa para estados, aumentar S levemente.
   - Para botões com texto sem contraste, sugerir `color.action.primary.on = #FFFFFF` e garantir contraste.

8. **Gerar relatório** — tabelas com problemas, severidade (High/Medium/Low) e patch sugerido (hex substituto + justificativa).

---

# 14. Algoritmo prático para correção automática de contraste

1. Entrada: corA (ex.: texto), corB (fundo), targetRatio (ex.: 4.5).
2. Se contraste(corA, corB) ≥ targetRatio → ok.
3. Caso contrário, fixe hue de corA e altere L em HSL:
   - Iterar passos: Δ = 1% de luminosidade, até 30 passos em cada direção (mais claro / mais escuro).
   - Recalcular contraste por passo; escolher menor Δ que alcance targetRatio com mínima alteração perceptual.

4. Se não for possível sem violar branding (ex.: ficar fora do gamut), marcar como _manual review_ e sugerir alternativa (usar neutro de apoio ou outline).

> Observação: prefira alterar `text` em vez de `background` para não quebrar layouts amplos.

---

# 15. Exemplos de regras CSS/variables

```css
:root {
  /* brand */
  --color-brand-500: #0b5fff;
  --color-brand-700: #0846cc;

  /* neutrals */
  --color-neutral-100: #f7f9fa;
  --color-neutral-900: #111216;

  /* text */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: #44454b;
  --color-text-disabled: rgba(17, 18, 22, 0.38);

  /* semantic */
  --color-success-500: #1db954;
  --color-error-500: #e5322b;
}
```

---

# 16. Boas práticas de documentação e exemplos

- Para cada token, documente: `nome`, `hex`, `usage` (quando usar), `do/don't` e `contrast` em relação às superfícies comuns.
- Inclua exemplos de componentes: botão primário, secundário, disabled; input com label; badge; alert; card; background.
- Forneça snippets de código e preview de estados (default, hover, focus, disabled).

---

# 17. Checklist rápido para revisão automática (para o agente)

- [ ] Todos tokens `color.*` mapeados
- [ ] `text.primary` ≥ 4.5:1 sobre `background.default`
- [ ] `text.secondary` ≥ 3:1 sobre `background.default`
- [ ] Botões primários: texto ≥ 4.5:1 sobre `button.bg`
- [ ] Banners/alerts: texto e ícone ≥ 4.5:1
- [ ] Simulação de daltonismo validada
- [ ] Focus visível em componentes interativos
- [ ] Touch targets ≥ 44x44 px
- [ ] Documentação de tokens com exemplos

---

# 18. Regras avançadas e recomendações estéticas

- Evite cores vibrantes em grandes áreas — use neutrals e mantenha cores saturadas para elementos pequenos/CTA.
- Combine tipografia, espaçamento e cor para criar ritmo: cor cria hierarquia secundária, not primary.
- Ao criar paletas para dark mode: inverta luminâncias mantendo a mesma hue e revalide contrastes (não só inverter hex!).
- Use opacidades com cuidado: text em opacidade sobre imagens requer um overlay (ex.: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))`).

---

# 19. Exemplos de recomendação gerada pelo agente (modelo)

**Problema detectado:** `color.text.secondary = #6E7378` sobre `color.background.default = #F7F9FA` → contraste 2.8:1 (abaixo de 3:1).

**Recomendação automática:** ajustar `color.text.secondary` para `#5A5E63` (contraste 3.1:1). Motivo: mantém a mesma hue, aumenta luminância relativa o suficiente para atingir 3:1.

**Patch sugerido:** no token file, substituir `color.text.secondary: #6E7378` → `color.text.secondary: #5A5E63`.

---

# 20. Entrega e integração com pipelines

- Exportar tokens em JSON (Design Tokens) — ex.: `tokens.json` com namespace `color`.
- Fornecer script de auditoria (node/python) que:
  1. Carrega tokens
  2. Executa checks (contraste, daltonismo, falta de tokens)
  3. Gera relatório e PR automático com patches sugeridos

- Incluir testes automatizados (unit/integration) que validem contraste para componentes críticos (ex.: header, CTA, footer links).

---

# 21. Conclusão

Este guia fornece um conjunto de regras técnico-práticas para criar, documentar e auditar paletas e tokens de cor. Um agente de IA, seguindo as heurísticas e algoritmos aqui descritos, consegue auditar automaticamente um Design System e propor alterações seguras que preservem a identidade de marca e a acessibilidade.

---

# Anexos (ferramentas e referências rápidas que o agente pode usar internamente)

- Função para calcular contraste (pseudocódigo) — seguir fórmula em seção 7.1.
- Lista de simulações de daltonismo (matrizes de transformação) para validar distinções.
- Script exemplo: converter tokens CSS para JSON e rodar validações.

<!-- Fim do documento -->
