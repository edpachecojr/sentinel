"use server";

import { redirect } from "next/navigation";
import { SairCommandHandler } from "@/application/handlers/SairCommandHandler";

export type EstadoSair =
  | { success: true }
  | { success: false; error: string };

export async function sairAction(): Promise<EstadoSair> {
  const handler = new SairCommandHandler();
  const resultado = await handler.handle();

  if (!resultado.success) {
    return { success: false, error: resultado.error };
  }

  redirect("/login");
}
