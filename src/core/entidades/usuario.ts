export interface Usuario {
  id: string;
  displayName: string;
  email: string;
  organizacaoId?: string;
  onboardingCompleted: boolean;
  criadoEm?: Date;
}
