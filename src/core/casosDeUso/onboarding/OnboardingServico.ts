import { generateId } from "@/utils/uuid";
import { generateSlug } from "@/utils/slug";
import type { Organizacao } from "@/core/entidades/organizacao";
import type { IOnboardingServico } from "./IOnboardingServico";
import type { IUnitOfWork } from "@/core/abstraction/IUnitOfWork";
import type { IOrganizacaoRepositorio } from "@/core/abstraction/repositories/IOrganizacaoRepositorio";
import type { IUsuarioRepositorio } from "@/core/abstraction/repositories/IUsuarioRepositorio";
import type { ConcluirOnboardingDto } from "./dtos/ConcluirOnboardingDto";
import type { ConcluirOnboardingResultado } from "./dtos/ConcluirOnboardingResultado";

export class OnboardingServico implements IOnboardingServico {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepositorio,
    private readonly usuarioRepo: IUsuarioRepositorio
  ) {}

  async concluir(
    userId: string,
    dto: ConcluirOnboardingDto
  ): Promise<ConcluirOnboardingResultado> {
    const organizacaoId = generateId();

    await this.uow.executar(async (tx) => {
      const organizacao: Organizacao = {
        id: organizacaoId,
        nome: dto.orgName,
        slug: generateSlug(dto.orgName),
      };

      await this.organizacaoRepo.criar(organizacao, tx);

      await this.usuarioRepo.atualizar(
        {
          id: userId,
          displayName: dto.displayName,
          organizacaoId,
          onboardingCompleted: true,
        },
        tx
      );
    });

    return { organizacaoId };
  }
}
