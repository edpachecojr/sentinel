import type { Organizacao } from "@/core/entidades/organizacao";

export interface IOrganizacaoRepositorio {
  criar(organizacao: Organizacao, tx?: unknown): Promise<void>;
}
