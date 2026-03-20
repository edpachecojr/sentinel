import { prisma } from "@/infrastructure/lib/db";
import { generateId } from "@/utils/uuid";
import type { IOnboardingServico } from "@/core/onboarding/IOnboardingServico";
import type { ConcluirOnboardingDto } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingDto";
import type { ConcluirOnboardingResultado } from "@/core/casosDeUso/onboarding/dtos/ConcluirOnboardingResultado";

function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class OnboardingServico implements IOnboardingServico {
  async concluir(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado> {
    const organizacaoId = generateId();

    await prisma.$transaction(async (tx) => {
      await tx.organizacao.create({
        data: {
          id: organizacaoId,
          nome: dto.orgName,
          slug: generateSlug(dto.orgName),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          displayName: dto.displayName,
          organizacaoId,
          onboardingCompleted: true,
        },
      });
    });

    return { organizacaoId };
  }
}
