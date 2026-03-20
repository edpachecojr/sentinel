export interface RegistrarUsuarioParams { nome: string; email: string; senha: string; }
export interface RegistrarUsuarioResultado { usuarioId: string; }
export interface AutenticarUsuarioParams { email: string; senha: string; }
export interface AutenticarUsuarioResultado { usuarioId: string; }

// Tipos de sessão
export interface UsuarioAutenticado {
  id: string;
  email: string;
  nome?: string;
  displayName?: string;
  onboardingCompleted?: boolean;
  organizacaoId?: string;
}

export interface SessaoAutenticada {
  sessao: { id: string };
  usuario: UsuarioAutenticado;
}

export interface OrganizacaoData {
  id: string;
  nome: string;
}

export interface IAutenticacaoServico {
  registrar(params: RegistrarUsuarioParams): Promise<RegistrarUsuarioResultado>;
  autenticar(params: AutenticarUsuarioParams): Promise<AutenticarUsuarioResultado>;
  sair(): Promise<void>;
  obterSessao(): Promise<SessaoAutenticada | null>;
  obterUsuario(): Promise<UsuarioAutenticado>;
  obterOrganizacao(): Promise<OrganizacaoData | null>;
}
