**Roteiro para Criar e Evoluir um Sistema em Next.js**

Resumo: roteiro prático com sequência de passos, boas práticas extraídas do texto fonte e recomendações adicionais para criar, manter e escalar um sistema Next.js.

1. Preparação inicial

- **Escolher nome do projeto:** evite espaços e caracteres especiais (uso do texto). Ex.: `my-app`.
- **Scaffold:** criar com `create-next-app` (use `--typescript` se possível). Incluir `src/` e `app` (App Router) conforme preferido.
- **Versionamento:** inicializar Git, criar branch de trabalho.

2. Configuração básica

- **TypeScript:** habilitar e ajustar `tsconfig.json`.
- **Lint & Format:** configurar `ESLint` + `@next/eslint-plugin` e `Prettier` (ou equivalente). Inserir scripts no `package.json`.
- **Estilização:** instalar Tailwind CSS opcionalmente; manter `globals.css` minimalista.
- **Dependências essenciais:** Next, React, React DOM, devtools (typescript, eslint, prettier, tailwind), libs de teste.

3. Estrutura do projeto e roteamento

- **Usar `src/app` (App Router):** organizar rotas via filesystem; cada pasta com `page.tsx` vira rota.
- **Layouts:** criar `layout.tsx` global e layouts por rota para estruturar cabeçalho, rodapé e `children`.
- **Componentes reutilizáveis:** manter em `src/components` (ex.: `Header/index.tsx`). Exportar index para import limpa.
- **Páginas especiais:** adicionar `not-found.tsx`, `loading.tsx` quando necessário.

4. Componentização e padrões (Server vs Client)

- **Server Components por padrão:** crie componentes server sempre que não precisar de estado cliente (melhor performance).
- **Client Components com `"use client"`:** só onde precisar de `useState`, `useEffect`, eventos ou interatividade.
- **Composição:** renderize Client Components dentro de Server Components para unir reatividade e render server.
- **Server Actions:** usar para submissões de formulários/actions que executam código no servidor (diretiva `use server`).

5. Data fetching e cache

- **Padrões de fetch:** preferir fetch no server (FAT/async) quando possível; usar client-fetch apenas quando necessário.
- **Cache & Revalidate:** usar `fetch(..., { next: { revalidate: <segundos> } })` ou `force-cache` conforme necessidade. Entender SSG/SSR/ISR.
- **Suspense & Streaming:** usar `Suspense` para áreas que fazem streaming; `loading.tsx` para loading de página inteira.

6. Rotas dinâmicas e navegação

- **Rotas dinâmicas:** criar pastas com `[id]` e usar `params` em `page.tsx` (ex.: `posts/[id]/page.tsx`).
- **Links internos:** usar `next/link` para navegação interna.

7. API e Middleware

- **API Routes / Route Handlers:** criar em `app/api/.../route.ts` para endpoints (GET, POST, PUT, DELETE).
- **Middleware:** implementar `middleware.ts` para autenticação, redirects e proteção de rotas (ex.: bloquear `/dashboard` quando não autenticado).

8. SEO e Metadata

- **Metadata por página:** usar `export const metadata` em `page.tsx` para `title`, `description`, `openGraph`, `robots`.
- **Defaults:** colocar metadata padrão no `layout.tsx` para fallback.

9. Experiência do usuário e performance

- **Minimizar bundles cliente:** evitar transformar em client components o que pode ser server.
- **Otimizar imagens:** usar `next/image` e formatos modernos; servir imagens do `public/` quando aplicável.
- **Evitar bloqueio de UI:** não executar chamadas longas que bloqueiem render; usar streaming/fallbacks.

10. Segurança e boas práticas operacionais

- **Variáveis de ambiente:** gerenciar com `.env` e não commitar segredos; usar plataformas de segredos para produção.
- **Validação e sanitização:** validar entradas no servidor (route handlers / server actions).
- **Headers e CORS:** configurar conforme necessidade via middleware ou headers de rota.

11. Testes e qualidade

- **Unit & Integration:** Jest + React Testing Library para componentes e utilitários.
- **E2E:** Playwright ou Cypress para fluxos críticos (login, checkout, forms).
- **Linting em CI:** rodar ESLint e testes em pipelines.

12. CI/CD e deploy

- **Pipelines:** configurar CI (GitHub Actions, GitLab CI) para lint, build, testes e deploy.
- **Deploy:** Vercel é referência para Next.js; também considerar Netlify ou infra própria (Docker + CDN).

13. Observabilidade e manutenção

- **Logs e erros:** integrar Sentry/LogRocket/otra solução; capturar erros server e client.
- **Monitoramento de performance:** usar métricas (Lighthouse, Vercel Analytics, Web Vitals).
- **Atualizações:** rotina para atualizar dependências e rodar auditorias de segurança.

14. Acessibilidade e internacionalização

- **A11y:** semântica HTML, roles, alt em imagens, contraste e testes automatizados de acessibilidade.
- **i18n:** usar `next-intl` ou built-in i18n para aplicações multilíngues.

15. Escala e arquitetura avançada

- **Monorepo / packages:** considerar PNPM monorepo (packages: design-system, ui, utils) se multiplicar apps.
- **Edge functions:** migrar handlers críticos para Edge quando latência for decisiva.

16. Documentação e onboarding

- **README e CONTRIBUTING:** incluir scripts, convenções de branch e setup local.
- **Component Catalog:** documentar componentes (Storybook ou MDX) e design tokens.

Checklist rápido de boas práticas extraídas do material

- Usar `src/` e App Router.
- Preferir TypeScript.
- Evitar nomes com acentos/caracteres especiais em pastas/projetos.
- Usar Tailwind opcionalmente (configurar `globals.css`).
- Preferir Server Components para reduzir JS cliente; usar `"use client"` apenas quando necessário.
- Usar `loading.tsx` e `Suspense` para UX de carregamento.
- Controlar cache com `revalidate` e `force-cache` para balancear frescor x performance.
- Usar server actions para formulários e ações que rodam no servidor.
- Implementar middleware para proteção de rotas.

Próximos passos sugeridos

- Configurar CI (GitHub Actions) com lint, build e testes.
- Criar templates de PR e convenção de commits.
- Implementar monitoramento (Sentry) e testes E2E mínimos.

Arquivo criado: roteiro-nextjs.md
