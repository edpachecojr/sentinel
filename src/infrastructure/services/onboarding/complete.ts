import { z } from "zod";
import { prisma } from "@/infrastructure/lib/db";
import { generateId } from "@/utils/uuid";

const completeOnboardingInputSchema = z.object({
  userId: z.string().uuid("User ID invalido"),
  displayName: z
    .string()
    .trim()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
  orgName: z
    .string()
    .trim()
    .min(2, "Nome da organizacao deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CompleteOnboardingInput = z.input<
  typeof completeOnboardingInputSchema
>;

export async function completeOnboardingService(input: unknown) {
  const validated = completeOnboardingInputSchema.parse(input);
  const organizacaoId = generateId();

  await prisma.$transaction(async (tx) => {
    await tx.organizacao.create({
      data: {
        id: organizacaoId,
        nome: validated.orgName,
        slug: generateSlug(validated.orgName),
      },
    });

    await tx.user.update({
      where: { id: validated.userId },
      data: {
        displayName: validated.displayName,
        organizacaoId,
        onboardingCompleted: true,
      },
    });
  });

  return { organizacaoId };
}
