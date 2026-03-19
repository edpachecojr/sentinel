import { z } from "zod";
import { UserRepository } from "@/infrastructure/repositories/UserRepository";
import { usuarioSchema } from "@/schemas/usuarioSchema";

const userIdSchema = z.string().uuid("User ID invalido");

export async function completeUserOnboardingService(
  userId: string,
  data: unknown,
) {
  const validatedId = userIdSchema.parse(userId);
  const validated = usuarioSchema.parse(data);
  const repository = new UserRepository();

  return repository.update(validatedId, validated);
}
