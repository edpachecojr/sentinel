import Usuario from "../models/Usuario";
import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "../casosDeUso/autenticacao/dtos/RegistrarUsuarioResultado";
import type { AutenticarUsuarioDto } from "../casosDeUso/autenticacao/dtos/AutenticarUsuarioDto";
import type { AutenticarUsuarioResultado } from "../casosDeUso/autenticacao/dtos/AutenticarUsuarioResultado";

export interface IAutenticacaoServico {
  autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado>;
  validarSessao(token: string): Promise<boolean>;
  sair(): Promise<void>;
  obterUsuarioPorToken(token: string): Promise<Usuario>;
  registrar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado>;
}