export interface RegistrarUsuarioCommand {
  nome: string;
  email: string;
  senha: string;
}

export interface RegistrarUsuarioResult {
  usuarioId: string;
}
