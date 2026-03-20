# Guia de Arquitetura em Camadas — Next.js + Core + Infra

## Visão Geral

Este guia documenta a divisão de responsabilidades entre as três camadas da aplicação, os contratos que cada uma expõe, o que trafega entre elas e as decisões de design que mantêm o sistema testável e evolutivo.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          APRESENTAÇÃO                                │
│                src/app  (Next.js — pages, components,                │
│                          actions, utils, hooks)                      │
│                                                                      │
│  Conhece: Commands do core, interfaces de handlers                   │
│  Não conhece: Prisma, banco, implementações de infra                 │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ instancia Command, chama Handler
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                             CORE                                     │
│          (Commands, Handlers, Entidades, Abstractions)               │
│                                                                      │
│  Conhece: suas próprias entidades e interfaces                       │
│  Não conhece: NADA de infra — nem Prisma, nem HTTP, nem Next.js      │
└──────────────┬───────────────────────────────────────┬──────────────┘
               │ define interfaces em                  │
               │ core/abstraction/                     │
               ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                             INFRA                                    │
│        (Prisma, Redis, SES, S3, repositórios concretos, UoW)         │
│                                                                      │
│  Conhece: tudo — Prisma, banco, serviços externos                    │
│  Implementa as interfaces definidas em core/abstraction/             │
└──────────────────────────────────────────────────────────────────────┘
```

A regra fundamental: **as dependências só apontam para dentro**. Infra depende de Core. Core não depende de ninguém. Apresentação depende de Core (interfaces e Commands). Ninguém depende de Apresentação.

---

## 1. Convenções de Nomenclatura

A nomenclatura segue camelCase ou PascalCase de acordo com o contexto e boas práticas TypeScript/JavaScript.

| Artefato | Convenção | Exemplo |
|---|---|---|
| Arquivos | camelCase | `concluirOnboarding.command.ts` |
| Classes | PascalCase | `ConcluirOnboardingHandler` |
| Interfaces | PascalCase com prefixo `I` | `IOrganizacaoRepository` |
| Funções e métodos | camelCase | `async executar()` |
| Variáveis e parâmetros | camelCase | `organizacaoId` |
| Componentes React | PascalCase | `OnboardingForm` |
| Server Actions | camelCase | `concluirOnboardingAction` |
| Instâncias no container | camelCase | `organizacaoRepo`, `prismaUow` |
| Pastas | camelCase | `casosDeUso/`, `abstraction/` |
| Sufixos de arquivo | camelCase | `.command.ts`, `.handler.ts`, `.repository.ts` |

---

## 2. Estrutura de Pastas

```
src/
├── app/                                    ← APRESENTAÇÃO (Next.js completo)
│   ├── (auth)/
│   │   └── onboarding/
│   │       ├── page.tsx
│   │       └── onboardingForm.tsx          ← PascalCase: componente React
│   ├── actions/
│   │   └── onboardingActions.ts            ← camelCase: módulo de actions
│   ├── hooks/
│   │   └── useOnboarding.ts
│   └── utils/
│       └── formatSlug.ts
│
├── core/
│   ├── entidades/
│   │   ├── usuario.ts                      ← interface de domínio
│   │   └── organizacao.ts
│   ├── abstraction/                        ← interfaces que infra implementa
│   │   ├── repositories/
│   │   │   ├── IUsuarioRepository.ts       ← PascalCase: é uma interface/tipo
│   │   │   └── IOrganizacaoRepository.ts
│   │   ├── servicos/
│   │   │   ├── IEmailServico.ts
│   │   │   └── IStorageServico.ts
│   │   └── IUnitOfWork.ts
│   └── casosDeUso/
│       └── onboarding/
│           ├── concluirOnboarding.command.ts   ← camelCase: módulo
│           └── concluirOnboardingHandler.ts    ← camelCase: módulo
│
├── infra/
│   ├── db/
│   │   └── prismaClient.ts
│   ├── repositories/
│   │   ├── prismaUsuarioRepository.ts
│   │   └── prismaOrganizacaoRepository.ts
│   ├── unitOfWork/
│   │   └── prismaUnitOfWork.ts
│   └── servicos/
│       ├── sesEmailServico.ts
│       └── s3StorageServico.ts
│
└── container.ts                            ← composição de todas as dependências
```

---

## 3. A Camada Core

O core é o coração da aplicação. Não importa se você usa Next.js, Express ou uma CLI — o core é sempre o mesmo. Ele não referencia nenhum pacote externo além de utilitários puros.

### 3.1 Entidades

Como as entidades não têm comportamento — apenas propriedades —, **interfaces são a escolha mais adequada neste caso**. Classes trazem overhead (construtores, `instanceof`, serialização) que só se justifica quando há métodos ou invariantes para proteger. Com entidades que são puramente estruturas de dados, a interface é mais leve, direta e alinhada com o uso em TypeScript.

> **Quando migrar para classe?**
> Se no futuro você precisar de validações internas (`if (!this.nome) throw ...`) ou métodos de comportamento (`usuario.completarOnboarding()`), aí vale converter para classe. Por enquanto, interface resolve com menos cerimônia.

```typescript
// core/entidades/usuario.ts
export interface Usuario {
  id: string;
  displayName: string;
  email: string;
  organizacaoId?: string;
  onboardingCompleted: boolean;
  criadoEm?: Date;
}
```

```typescript
// core/entidades/organizacao.ts
export interface Organizacao {
  id: string;
  nome: string;
  slug: string;
  criadoEm?: Date;
}
```

> O modelo Prisma gerado (`Prisma.User`, `Prisma.Organizacao`) é um detalhe de infra e **nunca deve aparecer no core**. O mapeamento entre eles fica dentro dos repositórios concretos.

### 3.2 Commands

O Command é o objeto que carrega a intenção de uma operação. Ele substitui o par "DTO de entrada + chamada direta ao serviço". No padrão Command Handler simples, cada operação tem seu próprio Command.

Commands são interfaces — apenas dados, sem comportamento.

```typescript
// core/casosDeUso/onboarding/concluirOnboarding.command.ts

export interface ConcluirOnboardingCommand {
  userId: string;
  displayName: string;
  orgName: string;
}

export interface ConcluirOnboardingResult {
  organizacaoId: string;
}
```

### 3.3 Handlers

O Handler contém a lógica de orquestração do caso de uso. Ele recebe o Command, coordena repositórios e serviços, e devolve um resultado.

```typescript
// core/casosDeUso/onboarding/concluirOnboardingHandler.ts

import { IOrganizacaoRepository } from '../../abstraction/repositories/IOrganizacaoRepository';
import { IUsuarioRepository } from '../../abstraction/repositories/IUsuarioRepository';
import { IUnitOfWork } from '../../abstraction/IUnitOfWork';
import {
  ConcluirOnboardingCommand,
  ConcluirOnboardingResult,
} from './concluirOnboarding.command';
import { generateId, generateSlug } from '../../utils';

export class ConcluirOnboardingHandler {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly organizacaoRepo: IOrganizacaoRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  async executar(command: ConcluirOnboardingCommand): Promise<ConcluirOnboardingResult> {
    const organizacaoId = generateId();

    await this.uow.executar(async (tx) => {
      await this.organizacaoRepo.criar(
        {
          id: organizacaoId,
          nome: command.orgName,
          slug: generateSlug(command.orgName),
        },
        tx
      );

      await this.usuarioRepo.atualizar(
        {
          id: command.userId,
          displayName: command.displayName,
          organizacaoId,
          onboardingCompleted: true,
        },
        tx
      );
    });

    return { organizacaoId };
  }
}
```

**Por que Handler e não Controller?**

Controllers são um conceito de camada de apresentação — lidam com HTTP, extraem parâmetros de request e montam responses. Handlers pertencem ao core e são agnósticos ao transporte: não sabem se a chamada veio de uma Server Action, de uma rota de API ou de um script de seed. Manter essa distinção é o que permite testar a lógica de negócio sem subir servidor.

```
Server Action (apresentação)
    └── valida dados com Zod
    └── monta ConcluirOnboardingCommand
    └── chama ConcluirOnboardingHandler.executar(command)
              └── orquestra repositórios e serviços (core → infra)
```

### 3.4 Abstractions — Interfaces de Repositórios

A pasta `abstraction/` contém os contratos que a infra deve cumprir. O core define o quê; a infra define o como.

```typescript
// core/abstraction/repositories/IOrganizacaoRepository.ts
import { Organizacao } from '../../entidades/organizacao';

export interface IOrganizacaoRepository {
  criar(organizacao: Organizacao, tx?: unknown): Promise<void>;
  buscarPorId(id: string): Promise<Organizacao | null>;
  buscarPorSlug(slug: string): Promise<Organizacao | null>;
}
```

```typescript
// core/abstraction/repositories/IUsuarioRepository.ts
import { Usuario } from '../../entidades/usuario';

export interface IUsuarioRepository {
  buscarPorId(id: string): Promise<Usuario | null>;
  atualizar(usuario: Partial<Usuario> & { id: string }, tx?: unknown): Promise<void>;
}
```

### 3.5 Unit of Work

O `IUnitOfWork` abstrai o conceito de transação sem expor nada de banco. O core coordena a transação sem saber que existe Prisma do outro lado.

```typescript
// core/abstraction/IUnitOfWork.ts
export interface IUnitOfWork {
  executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
```

### 3.6 Abstractions — Interfaces de Serviços Externos

Serviços como email, storage e pagamento também têm seus contratos definidos no core.

```typescript
// core/abstraction/servicos/IEmailServico.ts

export interface EnviarBoasVindasParams {
  destinatario: string;
  nomeUsuario: string;
  nomeOrganizacao: string;
}

export interface IEmailServico {
  enviarBoasVindas(params: EnviarBoasVindasParams): Promise<void>;
  enviarRedefinicaoSenha(destinatario: string, token: string): Promise<void>;
}
```

---

## 4. O Que Trafega Entre Cada Camada

Este é um dos pontos mais importantes para manter os limites saudáveis. Cada fronteira tem um tipo de dado esperado.

```
┌─────────────────────────────────────────────────────────────────┐
│                        APRESENTAÇÃO                             │
│                         src/app/                                │
│                                                                 │
│  Recebe: FormData, JSON bruto, parâmetros de URL                │
│  Valida com: Zod (na própria apresentação)                      │
│  Monta: Command do core                                         │
│  Retorna ao cliente: objeto serializado (sucesso/erro)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ Command (ex: ConcluirOnboardingCommand)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                           CORE                                  │
│                    Handler.executar(command)                     │
│                                                                 │
│  Recebe: Command                                                │
│  Usa internamente: Entidades (interfaces de domínio)            │
│  Passa p/ repositórios: Entidade do core + tx (opcional)        │
│  Passa p/ serviços externos: Params da operação                 │
│  Retorna: Result object (ex: ConcluirOnboardingResult)          │
└────────┬───────────────────────────────────┬────────────────────┘
         │ Entidade do core + tx?            │ Params DTO
         ▼                                  ▼
┌──────────────────────┐          ┌─────────────────────────────┐
│   REPOSITÓRIO        │          │    SERVIÇO DE INFRA         │
│  (infra)             │          │    (infra)                  │
│                      │          │                             │
│  Recebe: Entidade    │          │  Recebe: Params DTO         │
│  Mapeia para Prisma  │          │  Chama: SDK externo         │
│  Retorna: Entidade   │          │  Retorna: void ou Result    │
│  (mapeada de volta)  │          │                             │
└──────────┬───────────┘          └─────────────┬───────────────┘
           │                                    │
           ▼                                    ▼
      BANCO DE DADOS                    SERVIÇO EXTERNO
     (Prisma / PostgreSQL)          (SES, S3, Stripe, etc.)
```

### Repositório vs. Serviço de Infra — O Que Cada Um Recebe

| | Repositório | Serviço de Infra |
|---|---|---|
| **Propósito** | Persistir e recuperar entidades de domínio | Integrar com sistema externo |
| **Exemplos** | `PrismaUsuarioRepository` | `SesEmailServico`, `S3StorageServico` |
| **Entrada** | Entidade do core (ex: `Organizacao`) | Params DTO da operação (ex: `EnviarBoasVindasParams`) |
| **Saída** | Entidade do core mapeada ou `void` | `void`, `string`, ou Result simples |
| **Suporta transação?** | Sim — via parâmetro `tx` | Geralmente não |
| **Conhece Prisma?** | Sim | Não — usa SDK próprio (SES, S3...) |

**Por que repositório recebe entidade e serviço recebe Params DTO?**

O repositório é o espelho da entidade no banco. Ele salva e carrega `Organizacao`, `Usuario` — a correspondência é direta. Já um serviço de email não tem uma entidade equivalente: você não está persistindo um "Email", está executando uma operação pontual que precisa de alguns campos específicos. O Params DTO (`EnviarBoasVindasParams`) deixa explícito exatamente o que aquela operação precisa, sem expor a entidade inteira.

---

## 5. A Camada Infra

A infra implementa as interfaces definidas em `core/abstraction/`. Ela conhece Prisma, SDKs externos e banco — mas expõe apenas o contrato que o core espera.

### 5.1 Repositórios Concretos

```typescript
// infra/repositories/prismaOrganizacaoRepository.ts
import { PrismaClient } from '@prisma/client';
import { IOrganizacaoRepository } from '../../core/abstraction/repositories/IOrganizacaoRepository';
import { Organizacao } from '../../core/entidades/organizacao';

type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export class PrismaOrganizacaoRepository implements IOrganizacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async criar(organizacao: Organizacao, tx?: PrismaTx): Promise<void> {
    const client = tx ?? this.prisma;
    await client.organizacao.create({ data: organizacao });
  }

  async buscarPorId(id: string): Promise<Organizacao | null> {
    const result = await this.prisma.organizacao.findUnique({ where: { id } });
    return result ? this.toEntidade(result) : null;
  }

  async buscarPorSlug(slug: string): Promise<Organizacao | null> {
    const result = await this.prisma.organizacao.findUnique({ where: { slug } });
    return result ? this.toEntidade(result) : null;
  }

  // Mapeamento Prisma → Entidade do core — encapsulado no repositório
  private toEntidade(data: { id: string; nome: string; slug: string; criadoEm: Date }): Organizacao {
    return {
      id: data.id,
      nome: data.nome,
      slug: data.slug,
      criadoEm: data.criadoEm,
    };
  }
}
```

```typescript
// infra/repositories/prismaUsuarioRepository.ts
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { IUsuarioRepository } from '../../core/abstraction/repositories/IUsuarioRepository';
import { Usuario } from '../../core/entidades/usuario';

type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: string): Promise<Usuario | null> {
    const result = await this.prisma.user.findUnique({ where: { id } });
    return result ? this.toEntidade(result) : null;
  }

  async atualizar(usuario: Partial<Usuario> & { id: string }, tx?: PrismaTx): Promise<void> {
    const client = tx ?? this.prisma;
    const { id, ...data } = usuario;
    await client.user.update({ where: { id }, data });
  }

  private toEntidade(data: PrismaUser): Usuario {
    return {
      id: data.id,
      displayName: data.displayName ?? '',
      email: data.email,
      organizacaoId: data.organizacaoId ?? undefined,
      onboardingCompleted: data.onboardingCompleted,
      criadoEm: data.criadoEm,
    };
  }
}
```

> O método `toEntidade` é privado e fica dentro do repositório. É ele quem isola o modelo Prisma do resto da aplicação. Se o schema do banco mudar, só o repositório precisa ser ajustado.

### 5.2 Unit of Work Concreto

```typescript
// infra/unitOfWork/prismaUnitOfWork.ts
import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from '../../core/abstraction/IUnitOfWork';

export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn as any);
  }
}
```

### 5.3 Serviços de Infra

```typescript
// infra/servicos/sesEmailServico.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  IEmailServico,
  EnviarBoasVindasParams,
} from '../../core/abstraction/servicos/IEmailServico';

export class SesEmailServico implements IEmailServico {
  constructor(private readonly ses: SESClient) {}

  async enviarBoasVindas(params: EnviarBoasVindasParams): Promise<void> {
    await this.ses.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [params.destinatario] },
        Message: {
          Subject: { Data: `Bem-vindo, ${params.nomeUsuario}!` },
          Body: {
            Text: { Data: `Sua organização "${params.nomeOrganizacao}" foi criada com sucesso.` },
          },
        },
        Source: 'no-reply@seuapp.com',
      })
    );
  }

  async enviarRedefinicaoSenha(destinatario: string, token: string): Promise<void> {
    // implementação
  }
}
```

> Serviços de infra são **tradutores**: recebem um Params DTO do core e traduzem para a chamada do SDK externo. Lógica de negócio nunca entra aqui. Se você perceber que está colocando condicionais ou cálculos dentro de um serviço de infra, esse código provavelmente pertence ao Handler.

---

## 6. A Camada Apresentação (src/app)

A apresentação engloba tudo do Next.js: páginas, componentes, Server Actions, hooks e utils de UI. Ela é a camada mais fina em termos de lógica — sua responsabilidade é receber dados brutos, validar o formato, montar o Command e delegar ao Handler.

### 6.1 Server Action

```typescript
// app/actions/onboardingActions.ts
'use server';

import { z } from 'zod';
import { container } from '../../container';
import { getSessionUserId } from '../utils/session';

const concluirOnboardingSchema = z.object({
  displayName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  orgName: z.string().min(2, 'Nome da organização deve ter ao menos 2 caracteres'),
});

export async function concluirOnboardingAction(formData: FormData) {
  const userId = await getSessionUserId();

  const parsed = concluirOnboardingSchema.safeParse({
    displayName: formData.get('displayName'),
    orgName: formData.get('orgName'),
  });

  if (!parsed.success) {
    return { sucesso: false, erros: parsed.error.flatten().fieldErrors };
  }

  // Monta o Command — a apresentação conhece o shape, não a implementação
  const result = await container.concluirOnboardingHandler.executar({
    userId,
    displayName: parsed.data.displayName,
    orgName: parsed.data.orgName,
  });

  return { sucesso: true, organizacaoId: result.organizacaoId };
}
```

### 6.2 Componente que Consome a Action

```typescript
// app/(auth)/onboarding/onboardingForm.tsx
'use client';

import { useTransition } from 'react';
import { concluirOnboardingAction } from '../../actions/onboardingActions';

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await concluirOnboardingAction(formData);
      if (result.sucesso) {
        // redirecionar ou atualizar estado
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="displayName" placeholder="Seu nome" />
      <input name="orgName" placeholder="Nome da organização" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Concluir'}
      </button>
    </form>
  );
}
```

**Responsabilidades da apresentação:**
- Receber e validar formato dos dados de entrada (Zod)
- Extrair identidade do usuário (sessão/auth)
- Montar o Command e chamar o Handler via container
- Traduzir o resultado para estado React ou resposta HTTP

**O que a apresentação não faz:**
- Regras de negócio
- Acesso direto ao banco ou ao Prisma
- Lógica de orquestração entre entidades
- Importar implementações concretas de infra (apenas o container)

---

## 7. Composição das Dependências (container.ts)

O container é o único lugar da aplicação que conhece implementações concretas. Ele monta o grafo de dependências e expõe os Handlers prontos para uso.

```typescript
// container.ts
import { PrismaClient } from '@prisma/client';
import { SESClient } from '@aws-sdk/client-ses';

import { PrismaOrganizacaoRepository } from './infra/repositories/prismaOrganizacaoRepository';
import { PrismaUsuarioRepository } from './infra/repositories/prismaUsuarioRepository';
import { PrismaUnitOfWork } from './infra/unitOfWork/prismaUnitOfWork';
import { SesEmailServico } from './infra/servicos/sesEmailServico';

import { ConcluirOnboardingHandler } from './core/casosDeUso/onboarding/concluirOnboardingHandler';

// Clientes externos — instanciados uma vez
const prisma = new PrismaClient();
const ses = new SESClient({ region: 'us-east-1' });

// Infra
const organizacaoRepo = new PrismaOrganizacaoRepository(prisma);
const usuarioRepo = new PrismaUsuarioRepository(prisma);
const prismaUow = new PrismaUnitOfWork(prisma);
const emailServico = new SesEmailServico(ses);

// Handlers — recebem dependências via construtor
export const container = {
  concluirOnboardingHandler: new ConcluirOnboardingHandler(
    prismaUow,
    organizacaoRepo,
    usuarioRepo,
    emailServico
  ),
};
```

> Em projetos maiores, considere `awilix` ou `tsyringe` para gerenciar o container. Para aplicações Next.js de porte médio, a composição manual acima é simples, legível e suficiente.

---

## 8. Testabilidade

A separação de camadas torna os testes de unidade diretos — sem banco, sem HTTP, sem Next.js.

```typescript
// core/casosDeUso/onboarding/concluirOnboardingHandler.test.ts
import { ConcluirOnboardingHandler } from './concluirOnboardingHandler';
import { IUnitOfWork } from '../../abstraction/IUnitOfWork';
import { IOrganizacaoRepository } from '../../abstraction/repositories/IOrganizacaoRepository';
import { IUsuarioRepository } from '../../abstraction/repositories/IUsuarioRepository';

const mockUow: IUnitOfWork = {
  executar: jest.fn((fn) => fn({})),
};

const mockOrganizacaoRepo: IOrganizacaoRepository = {
  criar: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorSlug: jest.fn(),
};

const mockUsuarioRepo: IUsuarioRepository = {
  buscarPorId: jest.fn(),
  atualizar: jest.fn(),
};

describe('ConcluirOnboardingHandler', () => {
  it('deve criar organização e atualizar usuário dentro da mesma transação', async () => {
    const handler = new ConcluirOnboardingHandler(
      mockUow,
      mockOrganizacaoRepo,
      mockUsuarioRepo
    );

    await handler.executar({
      userId: 'user-123',
      displayName: 'João Silva',
      orgName: 'Minha Empresa',
    });

    expect(mockOrganizacaoRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Minha Empresa' }),
      expect.anything() // tx
    );

    expect(mockUsuarioRepo.atualizar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-123',
        displayName: 'João Silva',
        onboardingCompleted: true,
      }),
      expect.anything() // tx
    );
  });

  it('deve retornar o organizacaoId gerado', async () => {
    const handler = new ConcluirOnboardingHandler(
      mockUow,
      mockOrganizacaoRepo,
      mockUsuarioRepo
    );

    const result = await handler.executar({
      userId: 'user-123',
      displayName: 'João',
      orgName: 'Empresa',
    });

    expect(result.organizacaoId).toBeDefined();
    expect(typeof result.organizacaoId).toBe('string');
  });
});
```

---

## 9. Decisões de Design — Resumo

| Questão | Decisão | Motivo |
|---|---|---|
| Entidades: classe ou interface? | Interface (sem comportamento) | Sem métodos, a interface é mais leve e direta. Migrar para classe quando houver invariantes |
| Porta de entrada do core: Handler ou Controller? | Handler | Controllers são conceito de apresentação (HTTP). Handlers são agnósticos ao transporte |
| Como a apresentação chama o core? | Monta Command → chama `Handler.executar()` | Desacopla a intenção da implementação; facilita múltiplas entradas (action, API, CLI) |
| Onde ficam as interfaces? | `core/abstraction/` | Core define contratos; infra cumpre |
| Repositório recebe entidade ou Params DTO? | Entidade do core | Repositório é espelho direto da entidade no banco |
| Serviço de infra recebe entidade ou Params DTO? | Params DTO da operação | Operações externas raramente mapeiam 1:1 com entidades |
| Onde fica o mapeamento Prisma → Entidade? | Dentro do repositório concreto (`toEntidade`) | Isola o modelo Prisma; mudanças no schema afetam só o repositório |
| Transação atravessa camadas como? | `IUnitOfWork` + `tx: unknown` | Core coordena transação sem conhecer o ORM |
| Core chama Prisma diretamente? | ❌ Nunca | Quebra isolamento; impede testes sem banco |
| Apresentação importa implementações de infra? | ❌ Nunca | Só importa o `container` e interfaces/Commands do core |
| Onde compor as dependências? | `container.ts` na raiz de `src/` | Único ponto que instancia implementações concretas |
| Apresentação valida dados? | Sim, com Zod | Validação de formato é responsabilidade da borda de entrada |
| Lógica de negócio no serviço de infra? | ❌ Nunca | Serviços de infra só traduzem — lógica fica no Handler |

---

## 10. Checklist de Migração

Use esta lista para auditar o código existente e priorizar refatorações:

**Core**
- [ ] Handlers não importam `PrismaClient` nem qualquer pacote de infra
- [ ] Handlers não importam `next/headers`, `next/navigation` ou qualquer coisa do Next.js
- [ ] Entidades do core são independentes dos modelos Prisma
- [ ] Commands são objetos simples — apenas dados, sem comportamento
- [ ] Interfaces de repositórios e serviços ficam em `core/abstraction/`
- [ ] `IUnitOfWork` está em `core/abstraction/` e usa `tx: unknown`

**Infra**
- [ ] Repositórios concretos implementam as interfaces de `core/abstraction/`
- [ ] O mapeamento Prisma → Entidade fica dentro de cada repositório (`toEntidade`)
- [ ] Serviços de infra recebem Params DTOs — não entidades completas
- [ ] Nenhuma lógica de negócio dentro de serviços de infra

**Apresentação (src/app)**
- [ ] Server Actions apenas validam formato (Zod), montam Command e chamam Handler
- [ ] A apresentação não importa implementações concretas de infra — só o `container`
- [ ] Regras de negócio não estão em componentes nem em actions
- [ ] Componentes React (PascalCase) e actions/utils (camelCase) seguem convenção de nomenclatura

**Container**
- [ ] `container.ts` é o único lugar que instancia repositórios, UoW e serviços concretos
- [ ] Handlers recebem todas as dependências via construtor (sem instanciação interna)

**Testes**
- [ ] Testes de unidade dos Handlers rodam sem banco e sem HTTP
- [ ] Mocks implementam as interfaces de `core/abstraction/` — não classes concretas