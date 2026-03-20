# Sentinel

> A modern fullstack boilerplate for building scalable SaaS applications with Next.js, TypeScript, and TailwindCSS.

Sentinel is a production-ready foundation for fullstack web applications that combines **Next.js 16**, **TypeScript**, **Better Auth**, **Prisma ORM**, **TailwindCSS**, and a comprehensive 4-layer architecture pattern. Perfect for launching SaaS products with authentication, multi-tenancy, and real-time capabilities built-in.

---

## ✨ Features

- **🔐 Authentication & Authorization** — Better Auth with email/password, OAuth (Google, GitHub), and multi-factor authentication
- **👥 Multi-Tenancy** — Organizational scoping with role-based access control (RBAC)
- **📐 4-Layer Architecture** — Clean separation: UI → Actions → Core → Infrastructure
- **🎨 Modern UI** — TailwindCSS v4 with shadcn/ui components, responsive design, dark mode support
- **📊 Dashboard & Charts** — ApexCharts, FullCalendar, data visualization components
- **🗄️ Database** — PostgreSQL with Prisma v7 ORM, migrations, and soft deletes
- **✅ Testing Framework** — Vitest with vitest-mock-extended, comprehensive test setup
- **🔄 Real-Time Features** — Socket.io ready, form validation with React Hook Form + Zod
- **📱 Drag & Drop** — React DnD for interactive UI elements
- **🌍 Internationalization** — Built for pt-BR with i18n ready structure
- **📝 Server-Side Validation** — Zod schemas for type-safe data validation
- **🔍 SEO Optimized** — Metadata, Open Graph, structured data support

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or higher
- **pnpm** 8+ (recommended) or npm/yarn
- **PostgreSQL** 14+ (local or cloud-based like Neon)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/sentinel.git
cd sentinel

pnpm install
```

### 2. Setup Environment

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sentinel"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (optional)
GITHUB_CLIENT_ID="your-github-oauth-id"
GITHUB_CLIENT_SECRET="your-github-oauth-secret"
GOOGLE_CLIENT_ID="your-google-oauth-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"

# Email (Mailtrap or your provider)
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-mailtrap-user"
MAILTRAP_PASS="your-mailtrap-password"
MAILTRAP_FROM="noreply@sentinel.com"
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Open Prisma Studio
pnpm prisma studio
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Key Technologies

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | React fullstack framework |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5+ | Type safety |
| **TailwindCSS** | 4 | Utility-first CSS framework |
| **Prisma** | 7.4.2 | Type-safe ORM |
| **Better Auth** | 1.5.4 | Authentication & sessions |
| **Zod** | 4.3.6 | Schema validation |
| **React Hook Form** | 7.71.2 | Form state management |
| **ApexCharts** | 5.10.3 | Data visualization |
| **Vitest** | 4.0.18 | Unit testing |
| **Lucide React** | 0.577.0 | SVG icons |

---

## 📁 Project Structure

```
sentinel/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── _actions/         # Server Actions (mutations)
│   │   ├── _components/      # Reusable React components
│   │   ├── _hooks/           # Custom React hooks (client-side)
│   │   ├── _lib/             # Client utilities
│   │   ├── _schemas/         # Zod validation schemas
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (onboarding)/     # Onboarding flow
│   │   ├── (private)/        # Protected routes (dashboard, etc.)
│   │   ├── (landing)/        # Public landing pages
│   │   └── (api)/            # API routes (if needed)
│   │
│   ├── core/                 # Business logic & cases
│   │   ├── abstraction/      # Interfaces & contracts
│   │   ├── casosDeUso/       # Use cases (domain-driven)
│   │   └── entidades/        # Domain entities
│   │
│   ├── infra/                # Infrastructure layer
│   │   ├── lib/              # Configuration & singletons (auth, db, session, logger)
│   │   ├── services/         # Concrete implementations
│   │   ├── repositories/     # Database access layer
│   │   └── unitOfWork/       # Transaction management
│   │
│   ├── types/                # Global TypeScript types
│   ├── utils/                # Shared utilities (moeda, data, cpf, etc.)
│   ├── proxy.ts              # GraphQL/tRPC proxy (if used)
│   └── container.ts          # Dependency injection container
│
├── prisma/
│   ├── schema.prisma         # Prisma data model
│   └── migrations/           # Database migrations
│
├── tests/
│   ├── setup.ts              # Vitest global config
│   ├── mocks/                # Mock builders & fixtures
│   ├── core/                 # Core layer tests
│   └── services/             # Service layer tests
│
├── docs/                     # Documentation
├── public/                   # Static assets
├── .github/                  # GitHub workflows & CI/CD
├── .env.example              # Environment template
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # TailwindCSS configuration
├── vitest.config.ts          # Vitest configuration
└── prisma.config.ts          # Prisma configuration
```

---

## 🏗️ 4-Layer Architecture

Sentinel follows a strict 4-layer architecture for scalability and maintainability:

```
┌─────────────────────────────────────────┐
│    PRESENTATION LAYER                   │
│  src/app/* (Pages, Components, Actions) │
└────────────────────┬────────────────────┘
                     │ uses
┌────────────────────▼────────────────────┐
│    CORE LAYER                           │
│  src/core/* (Business Logic, Cases)     │
└────────────────────┬────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────┐
│    INFRASTRUCTURE LAYER                 │
│  src/infra/* (Repos, Services, DB)      │
└────────────────────┬────────────────────┘
                     │ uses
┌────────────────────▼────────────────────┐
│    LIB LAYER                            │
│  src/infra/lib/* (Auth, DB, Logger)     │
└─────────────────────────────────────────┘
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easy to test independently
- ✅ Prevents circular dependencies
- ✅ Facilitates scaling and refactoring

For detailed architecture guidelines, see [AGENTS.md](./AGENTS.md).

---

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev                  # Start dev server with hot reload

# Building
pnpm build               # Build for production
pnpm start               # Start production server

# Code Quality
pnpm lint                # Run ESLint
pnpm prettier --write .  # Format code with Prettier

# Testing
pnpm test:run            # Run tests once
pnpm test:watch          # Watch mode (TDD)

# Database
pnpm prisma generate     # Regenerate Prisma client
pnpm prisma migrate dev  # Create & apply migration
pnpm prisma migrate reset # Reset database (dev only)
pnpm prisma studio      # Open Prisma GUI
```

### Adding a New Feature

Follow the [AGENTS.md Development Guidelines](./AGENTS.md#13-desenvolvimento-de-novas-features):

1. **Plan** — Create `plans/<feature>/plan.md`
2. **Core** — Define interfaces in `src/core/`
3. **Infra** — Implement repositories in `src/infra/repositories/`
4. **Service** — Create business logic in `src/infra/services/`
5. **Actions** — Expose Server Actions in `src/app/_actions/`
6. **Components** — Build UI in `src/app/_components/`
7. **Test** — Write tests following RED-GREEN-REFACTOR
8. **Validate** — Run `lint`, `test:run`, `build`

---

## ✅ Testing

Sentinel uses **Vitest** with TDD workflow:

### Running Tests

```bash
# Run all tests once
pnpm test:run

# Watch mode (recommended for TDD)
pnpm test:watch

# Run specific test file
pnpm test:run tests/services/fretes.test.ts

# Run tests matching pattern
pnpm test:run -t "should validate email"
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FreteService } from "@/services/fretes/FreteService";

describe("FreteService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should create frete with validated data", async () => {
    const service = new FreteService(mockRepository);
    const result = await service.criar(validData, orgId);
    expect(result).toBeDefined();
  });
});
```

### Mocks & Fixtures

Use test builders from `tests/mocks/auth.ts`:

```typescript
import { AUTH_TEST_UUIDS, buildAuthenticatedSession } from "@/tests/mocks/auth";

const orgId = AUTH_TEST_UUIDS.ORG_ID;
const session = buildAuthenticatedSession(orgId);
```

---

## 🔐 Security Checklist

- ✅ **Never trust `organizacaoId` from client input** — Always get from `sessionService.requireOrgSession()`
- ✅ **Validate all input with Zod** — Enforce at service boundary
- ✅ **Use soft deletes** — Set `deletadoEm` instead of hard delete
- ✅ **Sanitize error messages** — Show friendly pt-BR messages
- ✅ **Encrypt sensitive data** — Passwords handled by Better Auth
- ✅ **Setup CSRF protection** — Better Auth provides CSRF tokens
- ✅ **Rate limit auth endpoints** — Prevent brute force attacks
- ✅ **Use HTTPS in production** — Required for Better Auth

---

## 📝 Internationalization (i18n)

- **Default Language:** Portuguese (pt-BR)
- **User-facing strings:** Always in Portuguese
- **Code comments & identifiers:** English
- **Dates & Currency:** Formatted via `@/utils/data.ts` and `@/utils/moeda.ts`

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Link to Vercel
vercel link

# Deploy
vercel deploy
```

**Environment Variables on Vercel:**
- Set all `.env.local` variables in Vercel's dashboard
- Ensure `DATABASE_URL` points to production database
- Use secure BETTER_AUTH_SECRET (min 32 chars)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

### Self-Hosted

```bash
pnpm build
pnpm start  # Runs on PORT 3000
```

---

## 📚 Additional Resources

- **[AGENTS.md](./AGENTS.md)** — Full development guidelines & patterns
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System architecture decisions
- **[PRD.md](./PRD.md)** — Product requirements (reference)
- **[Next.js Docs](https://nextjs.org/docs)** — Next.js documentation
- **[Prisma Docs](https://www.prisma.io/docs)** — Database ORM guide
- **[Better Auth Docs](https://www.better-auth.dev)** — Authentication setup
- **[TailwindCSS Docs](https://tailwindcss.com/docs)** — Styling guide

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feat/your-feature`
3. **Follow AGENTS.md patterns** — Respect architecture & code style
4. **Write tests** — Use RED-GREEN-REFACTOR workflow
5. **Commit with conventional style** — `feat(scope): description`
6. **Open a Pull Request** — Include description & testing notes

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 💬 Support

- **Issues & Bugs** — [GitHub Issues](https://github.com/yourusername/sentinel/issues)
- **Discussions** — [GitHub Discussions](https://github.com/yourusername/sentinel/discussions)
- **Documentation** — See [AGENTS.md](./AGENTS.md) for detailed guidelines

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
