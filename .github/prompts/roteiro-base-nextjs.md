# 🗺️ Roteiro — Base Sólida para Projeto Next.js

> Executar após `npx create-next-app@latest` com TypeScript, ESLint, Tailwind CSS e App Router habilitados.

---

## 1. Estrutura de Pastas

Organize o projeto com a seguinte estrutura antes de qualquer configuração:

```
src/
├── app/                    # App Router (rotas, layouts, pages)
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── shared/             # Componentes reutilizáveis do projeto
├── lib/
│   ├── auth.ts             # Instância do better-auth
│   ├── db.ts               # Instância do Prisma
│   ├── validations/        # Schemas Zod
│   └── utils.ts            # Funções utilitárias (cn, etc.)
├── actions/                # Server Actions
├── hooks/                  # React custom hooks
└── types/                  # Types/Interfaces TypeScript globais
```

---

## 2. Fontes com `next/font`

> 📄 Ref: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

Configure fontes diretamente no layout raiz para zero layout shift.

```ts
// src/app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

No `tailwind.config.ts`, mapeie a variável CSS:

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-inter)", ...fontFamily.sans],
    },
  },
},
```

## 2.1 Design System — Preparar e Estruturar

> Crie um design system como fonte de verdade (arquivo `design-system.md` e/ou `design.json`) e integre tokens com Tailwind, CSS variables e seus componentes UI.

### Objetivo

- Ter tokens centralizados (cores, tipografia, espaçamentos, radii, sombras, z-index) em `src/design-system/design.json`.
- Expor esses tokens como CSS variables e como imports TypeScript para uso em componentes e no `tailwind.config.ts`.

### Passos recomendados (usar arquivos existentes)

- Não crie novos arquivos por padrão — siga os artefatos já presentes no repositório (por exemplo `docs/design-system.md`, `design-system.md`, `src/design-system/design.json` ou `design-system.json`). A seção do roteiro assume que existe um "source of truth" de design (JSON ou Markdown) e explica como integrá-lo.

- Fluxo recomendado ao trabalhar com arquivos existentes:
  - Localize o arquivo source-of-truth. Possíveis locais: `docs/design-system.md`, `design-system.md`, `src/design-system/design.json`.
  - Se houver um `design.json`, ele deve conter tokens (colors, font, spacing, radius, shadows). Use-o como referência direta para mapear CSS variables e Tailwind tokens.
  - Se houver apenas um `design-system.md`, siga as seções e tokens documentados nele — converta mentalmente ou via script para o formato de tokens que sua build consome.

- Integração prática (sem criar arquivos novos automaticamente):
  - Mapear tokens do JSON/MD para CSS vars no arquivo de estilos global já existente (por exemplo, importe as variáveis no `src/app/globals.css`).
  - No `tailwind.config.ts`, referencie as CSS variables produzidas pelo design-system (por exemplo `colors: { primary: 'var(--color-primary)' }`).
  - Garanta que os componentes UI (em `src/components/` ou `src/components/ui`) consumam tokens via classes utilitárias ou CSS vars, mantendo compatibilidade com `shadcn/ui`.

- Exemplos de mapeamento (apenas referência — não criaremos arquivos):
  - JSON token -> CSS var (pseudocódigo):

    {
    "colors": { "primary": "#0ea5a4" }
    }

    → CSS:

    :root { --color-primary: #0ea5a4; }

  - Tailwind config snippet (referência):

    module.exports = {
    theme: {
    extend: {
    colors: {
    primary: 'var(--color-primary)'
    }
    }
    }
    }

- Boas práticas: mantenha o `design.json`/`design-system.md` como fonte única; adicione um pequeno script de sincronização na pipeline de build apenas se for necessário validar/gerar assets (opcional).

### Resultados esperados

- O projeto consome o design system já existente como fonte de verdade.
- Tokens ficam disponíveis como CSS variables e via mapeamento em `tailwind.config.ts`.
- Componentes padronizados usam tokens do arquivo existente, facilitando theming e manutenção.

---

## 3. Tailwind CSS + shadcn/ui + Radix UI

> 📄 Ref shadcn: https://ui.shadcn.com/docs/installation/next  
> 📄 Ref Radix: https://www.radix-ui.com/primitives/docs/overview/getting-started

**3.1 — Inicializar shadcn/ui:**

```bash
npx shadcn@latest init
```

Escolha: `Default` style, `Zinc` ou outra base color, CSS variables habilitado.

**3.2 — Adicionar componentes conforme necessidade:**

```bash
npx shadcn@latest add button input label form dialog
```

**3.3 — Utilitário `cn`:**

O shadcn já instala `clsx` e `tailwind-merge`. Confirme que `src/lib/utils.ts` contém:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 4. Prisma ORM

> 📄 Ref: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql

**4.1 — Instalar:**

```bash
npm install prisma @prisma/client
npx prisma init
```

**4.2 — Configurar `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

**4.3 — Instância singleton (evita múltiplas conexões em dev):**

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

**4.4 — UUIDs como IDs no schema:**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 5. UUID v4

> 📄 Ref: https://github.com/uuidjs/uuid

```bash
npm install uuid
npm install -D @types/uuid
```

Uso:

```ts
import { v4 as uuidv4 } from "uuid";

const id = uuidv4(); // "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
```

> ⚠️ Para IDs no banco, prefira o `@default(uuid())` do Prisma diretamente no schema. Use `uuidv4()` manualmente apenas quando necessário fora do contexto do ORM.

---

## 6. Autenticação com better-auth

> 📄 Ref: https://www.better-auth.com/docs/installation

**6.1 — Instalar:**

```bash
npm install better-auth
```

**6.2 — Configurar instância:**

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  // adicione providers OAuth aqui se necessário
});
```

**6.3 — Criar Route Handler:**

```ts
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**6.4 — Gerar tabelas no banco:**

```bash
npx @better-auth/cli generate
npx prisma migrate dev --name add-auth-tables
```

**6.5 — Client-side helper:**

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

---

## 7. Validação com Zod

> 📄 Ref: https://zod.dev

```bash
npm install zod
```

Organize schemas em `src/lib/validations/`:

```ts
// src/lib/validations/auth.ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const signUpSchema = signInSchema
  .extend({
    name: z.string().min(2, "Nome muito curto"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
```

---

## 8. Formulários com React Hook Form + Zod

> 📄 Ref RHF: https://react-hook-form.com/get-started  
> 📄 Ref resolvers: https://github.com/react-hook-form/resolvers

```bash
npm install react-hook-form @hookform/resolvers
```

Exemplo de formulário com shadcn/ui:

```tsx
// src/components/shared/sign-in-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    // chamar server action ou authClient aqui
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Entrar
        </Button>
      </form>
    </Form>
  );
}
```

---

## 9. Server Actions

> 📄 Ref: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

**9.1 — Padrão recomendado com validação Zod:**

```ts
// src/actions/example.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
});

export async function createItemAction(formData: z.infer<typeof schema>) {
  const parsed = schema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const item = await db.item.create({
    data: { name: parsed.data.name },
  });

  return { success: true, data: item };
}
```

**9.2 — Habilitar Server Actions explicitamente (Next.js 14+):**

Já estão habilitadas por padrão no App Router. Basta usar a diretiva `"use server"`.

---

## 10. Proxy / Rewrites (proxy.ts)

> 📄 Ref: https://nextjs.org/docs/app/api-reference/next-config-js/rewrites

Para proxying de APIs externas ou internas, use `next.config.ts`:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: `${process.env.EXTERNAL_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

Para um helper de cliente HTTP centralizado:

```ts
// src/lib/api.ts
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
```

---

## 11. Variáveis de Ambiente

Crie os arquivos de ambiente e nunca comite segredos:

```bash
# .env.local (nunca commitar)
DATABASE_URL=
BETTER_AUTH_SECRET=        # openssl rand -hex 32
BETTER_AUTH_URL=           # http://localhost:3000
NEXT_PUBLIC_APP_URL=       # http://localhost:3000
EXTERNAL_API_URL=          # URL da API externa se houver
```

```bash
# .env.example (commitar como referência)
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=
```

Adicione ao `.gitignore`:

```
.env
.env.local
.env.production
```

---

## 12. Scripts e Checklist Final

Adicione ao `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts"
}
```

### ✅ Checklist de Setup

- [ ] `create-next-app` com TypeScript, ESLint, Tailwind, App Router
- [ ] Estrutura de pastas criada
- [ ] `next/font` configurado no layout raiz
- [ ] `shadcn/ui` inicializado (`npx shadcn@latest init`)
- [ ] Prisma instalado, `.env` configurado, schema com UUID
- [ ] Migration inicial executada (`prisma migrate dev`)
- [ ] `uuid` instalado
- [ ] `better-auth` configurado com Prisma adapter
- [ ] Route handler de auth criado (`/api/auth/[...all]`)
- [ ] Tabelas de auth geradas e migradas
- [ ] Schemas Zod criados em `src/lib/validations/`
- [ ] `react-hook-form` + `@hookform/resolvers` instalados
- [ ] Exemplo de Server Action funcional
- [ ] `.env.example` commitado, `.env.local` no `.gitignore`

---

## 📦 Resumo de Dependências

```bash
# Produção
npm install prisma @prisma/client better-auth uuid zod react-hook-form @hookform/resolvers

# Dev
npm install -D @types/uuid
```

```bash
# CLI
npx shadcn@latest init
npx @better-auth/cli generate
npx prisma migrate dev --name init
```
