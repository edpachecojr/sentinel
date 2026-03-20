import z from "zod";

export const concluirOnboardingCommand = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  orgName: z
    .string()
    .trim()
    .min(2, { message: "Nome da empresa deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome da empresa deve ter no máximo 100 caracteres" }),
});

export type ConcluirOnboardingCommand = z.infer<typeof concluirOnboardingCommand>;
