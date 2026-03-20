import { z } from "zod";

export const autenticarUsuarioCommand = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

export type AutenticarUsuarioCommand = z.infer<typeof autenticarUsuarioCommand>;
