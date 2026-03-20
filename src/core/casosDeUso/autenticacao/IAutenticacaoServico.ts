import type { RegistrarUsuarioDto } from "@/core/casosDeUso/autenticacao/dtos/RegistrarUsuarioDto";
import type { RegistrarUsuarioResultado } from "./dtos/RegistrarUsuarioResultado";
import type { AutenticarUsuarioDto } from "./dtos/AutenticarUsuarioDto";
import type { AutenticarUsuarioResultado } from "./dtos/AutenticarUsuarioResultado";

export interface IAutenticacaoServico {
  autenticar(dto: AutenticarUsuarioDto): Promise<AutenticarUsuarioResultado>;
  sair(): Promise<void>;
  registrar(data: RegistrarUsuarioDto): Promise<RegistrarUsuarioResultado>;
}