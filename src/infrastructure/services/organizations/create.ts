import { OrganizationRepository } from "@/infrastructure/repositories/OrganizationRepository";
import { organizacaoSchema } from "@/schemas/organizacaoSchema";
import { generateId } from "@/utils/uuid";

function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrganizationService(data: unknown) {
  const validated = organizacaoSchema.parse(data);
  const repository = new OrganizationRepository();

  return repository.create({
    id: generateId(),
    nome: validated.nome,
    slug: generateSlug(validated.nome),
  });
}
