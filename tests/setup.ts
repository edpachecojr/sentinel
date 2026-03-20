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
const mockedPrisma = {
  $transaction: vi.fn(),
  user: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  organizacao: { create: vi.fn(), findUnique: vi.fn() },
  veiculo: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  frete: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  registroAbastecimento: { findMany: vi.fn(), create: vi.fn() },
  registroManutencao: { findMany: vi.fn(), create: vi.fn() },
  despesaGeral: { findMany: vi.fn(), create: vi.fn() },
};

vi.mock("@/infra/db/prismaClient", () => ({ prisma: mockedPrisma }));
vi.mock("@/infra/lib/db", () => ({ prisma: mockedPrisma })); // Backward compat alias

// Mock server-only
vi.mock("server-only", () => ({}));
