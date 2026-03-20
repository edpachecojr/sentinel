import { describe, it } from "vitest";

/**
 * Esta pasta contém testes para implementações concretas de Infrastructure.
 * 
 * Os testes de OnboardingServico foram consolidados em:
 * - tests/core/onboarding/OnboardingServico.test.ts (lógica de negócio do Core)
 * - tests/infrastructure/services/onboarding/PrismaUnitOfWork.test.ts (implementações Prisma)
 * 
 * Pois a lógica de orquestração agora fica no Core com injeção de dependência,
 * e as implementações Prisma ficam em Infrastructure.
 */

describe.skip("OnboardingServico - Tests consolidated", () => {
  it.skip("see tests/core/onboarding and tests/infrastructure", () => {
    // Placeholder — tests consolidated
  });
});
