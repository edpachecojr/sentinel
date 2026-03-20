import { generateId } from "@/utils/uuid";
import { generateSlug } from "@/utils/slug";
import { Organizacao } from "@/core/models/Organizacao";
import type { IOnboardingServico } from "./IOnboardingServico";
import type { IUnitOfWork } from "@/core/abstractions/IUnitOfWork";
import type { IOrganizacaoRepositorio } from "@/core/repositorios/IOrganizacaoRepositorio";
import type { IUsuarioRepositorio } from "@/core/repositorios/IUsuarioRepositorio";
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
      const organizacao = new Organizacao(
        organizacaoId,
        dto.orgName,
        generateSlug(dto.orgName)
      );

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
