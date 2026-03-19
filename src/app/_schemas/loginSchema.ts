import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email invalido" }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
