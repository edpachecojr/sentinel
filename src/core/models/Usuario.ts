import { Organizacao } from "./Organizacao";

export default class Usuario {
  readonly id: string;
  nome: string;
  email: string;
  displayName: string;
  organizacao: Organizacao;

  constructor(
    id: string,
    nome: string,
    email: string,
    displayName: string,
    organizacao: Organizacao
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.displayName = displayName;
    this.organizacao = organizacao;
  }
}
