export interface RegistrarUsuarioParams { nome: string; email: string; senha: string; }
export interface RegistrarUsuarioResultado { usuarioId: string; }
export interface AutenticarUsuarioParams { email: string; senha: string; }
export interface AutenticarUsuarioResultado { usuarioId: string; }

export interface IAutenticacaoServico {
  registrar(params: RegistrarUsuarioParams): Promise<RegistrarUsuarioResultado>;
  autenticar(params: AutenticarUsuarioParams): Promise<AutenticarUsuarioResultado>;
  sair(): Promise<void>;
}
