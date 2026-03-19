export type PlanoOrganizacao = "GRATUITO" | "PREMIUM" | "EMPRESARIAL";

export class Organizacao {
  id: string;
  nome: string;
  slug: string;
  plano?: PlanoOrganizacao;
  criadoEm?: Date;
  atualizadoEm?: Date;
  deletadoEm?: Date | null;

    constructor(
      id: string,
      nome: string,
      slug: string,
      plano?: PlanoOrganizacao,
      criadoEm?: Date,
      atualizadoEm?: Date,
      deletadoEm?: Date | null
    ) {
      this.id = id;
      this.nome = nome;
      this.slug = slug;
      this.plano = plano;
      this.criadoEm = criadoEm;
      this.atualizadoEm = atualizadoEm;
      this.deletadoEm = deletadoEm;
    }

};