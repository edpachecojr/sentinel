import Usuario from "../models/Usuario";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "../casosDeUso/autenticacao/dtos/RegistrarUsuarioResultado";

export interface IAutenticacaoServico {
  autenticar(email: string, senha: string): Promise<string>;
  validarSessao(token: string): Promise<boolean>;
  invalidarSessao(token: string): Promise<void>;
  obterUsuarioPorToken(token: string): Promise<Usuario>;
  registrar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado>;
}