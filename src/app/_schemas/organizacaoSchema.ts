import { z } from "zod";

export const organizacaoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

export type OrganizacaoInput = z.input<typeof organizacaoSchema>;
export type OrganizacaoOutput = z.output<typeof organizacaoSchema>;
