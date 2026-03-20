export type AtualizarUsuarioDto = {
  id: string;
  displayName: string;
  organizacaoId: string;
  onboardingCompleted: boolean;
};

export interface IUsuarioRepositorio {
  atualizar(usuario: AtualizarUsuarioDto, tx?: unknown): Promise<void>;
}
