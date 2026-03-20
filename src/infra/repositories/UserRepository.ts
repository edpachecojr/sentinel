import { prisma } from "@/infra/db/prismaClient";

export type UpdateUserData = {
  displayName?: string;
  organizacaoId?: string;
  onboardingCompleted?: boolean;
};

export class UserRepository {
  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
