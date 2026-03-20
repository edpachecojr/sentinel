import type { IUnitOfWork } from "@/core/abstraction/IUnitOfWork";
import type { IOrganizacaoRepositorio } from "@/core/abstraction/repositories/IOrganizacaoRepositorio";
import type { IUsuarioRepositorio } from "@/core/abstraction/repositories/IUsuarioRepositorio";
import type { ConcluirOnboardingCommand, ConcluirOnboardingResult } from "./concluirOnboarding.command";
import { generateId } from "@/utils/uuid";
import { generateSlug } from "@/utils/slug";

export class ConcluirOnboardingHandler {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepositorio,
    private readonly usuarioRepo: IUsuarioRepositorio,
  ) {}

  async executar(userId: string, command: ConcluirOnboardingCommand): Promise<ConcluirOnboardingResult> {
    const organizacaoId = generateId();

    await this.uow.executar(async (tx) => {
      await this.organizacaoRepo.criar(
        {
          id: organizacaoId,
          nome: command.orgName,
          slug: generateSlug(command.orgName),
        },
        tx,
      );

      await this.usuarioRepo.atualizar(
        {
          id: userId,
          displayName: command.displayName,
          organizacaoId,
          onboardingCompleted: true,
        },
        tx,
      );
    });

    return { organizacaoId };
  }
}
