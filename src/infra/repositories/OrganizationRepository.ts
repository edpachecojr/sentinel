import { prisma } from "@/infra/db/prismaClient";
import type { CreateOrganizationData } from "@/types/organization";

export class OrganizationRepository {
  async create(data: CreateOrganizationData) {
    return prisma.organizacao.create({ data });
  }
}
