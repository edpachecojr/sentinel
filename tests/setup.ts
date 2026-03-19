import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    organizacao: { create: vi.fn(), findUnique: vi.fn() },
    veiculo: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    frete: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    registroAbastecimento: { findMany: vi.fn(), create: vi.fn() },
    registroManutencao: { findMany: vi.fn(), create: vi.fn() },
    despesaGeral: { findMany: vi.fn(), create: vi.fn() },
  },
}));

// Mock server-only
vi.mock("server-only", () => ({}));
