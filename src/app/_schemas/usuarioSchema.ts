import { z } from "zod";

export const usuarioSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
  organizacaoId: z.string().uuid("Organization ID invalido"),
  onboardingCompleted: z.literal(true),
});

export type UsuarioInput = z.input<typeof usuarioSchema>;
export type UsuarioOutput = z.output<typeof usuarioSchema>;
