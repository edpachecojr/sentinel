import type { Organizacao } from "@/core/entidades/organizacao";

export interface IOrganizacaoRepositorio {
  criar(organizacao: Organizacao, tx?: unknown): Promise<void>;
  buscarPorId(id: string): Promise<{ id: string; nome: string } | null>;
}
