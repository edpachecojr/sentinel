import { prisma } from "@/infrastructure/lib/db";
import type { CreateOrganizationData } from "@/types/organization";

export class OrganizationRepository {
  async create(data: CreateOrganizationData) {
    return prisma.organizacao.create({ data });
  }
}
