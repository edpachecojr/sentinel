import type { Organizacao } from "@/core/models/Organizacao";

export interface IOrganizacaoRepositorio {
  criar(organizacao: Organizacao, tx?: unknown): Promise<void>;
}
