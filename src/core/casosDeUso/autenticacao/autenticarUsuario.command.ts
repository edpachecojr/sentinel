export interface AutenticarUsuarioCommand {
  email: string;
  senha: string;
}

export interface AutenticarUsuarioResult {
  usuarioId: string;
}
