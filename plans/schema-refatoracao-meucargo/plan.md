# Refatoração do Schema Prisma — NeoAgenda → MeuCargueiro

**Branch:** `feat/schema-refatoracao-meucargo`
**Description:** Remove todos os modelos e enums do NeoAgenda e implementa os modelos de negócio do MeuCargueiro (Veiculo, Frete, RegistroAbastecimento, RegistroManutencao, DespesaGeral)

## Goal

O schema Prisma atual pertence ao projeto NeoAgenda (sistema de saúde), mas o produto MeuCargueiro exige entidades completamente distintas. Este PR substitui integralmente os modelos de negócio no `schema.prisma`, preserva os modelos obrigatórios do better-auth e cria a migration de banco de dados correspondente.

---

## Contexto Técnico

### O que existe hoje (a remover)

**7 modelos de negócio NeoAgenda:**
- `Paciente`, `Agendamento`, `RecorrenciaAgendamento`, `Prontuario`, `Anamnese`, `Atendimento`, `Evolucao`, `Diagnostico`

**17 enums NeoAgenda:**
- `ModalidadeAgendamento`, `TipoRecorrencia`, `StatusAgendamento`, `FontePaciente`, `GeneroPaciente`, `TipoPagador`, `StatusProntuario`, `TipoAnamnese`, `StatusAtendimento`, `TipoEvolucao`, `NivelConsciencia`, `Orientacao`, `Respiracao`, `Alimentacao`, `ConsistenciaAlimentacao`, `Liquidos`, `EscalaFOIS`

**Referências NeoAgenda em `User` (campos de relação a remover):**
- `anamneses`, `atendimentosCriados`, `atendimentosAtualizados`, `atendimentosUsuario`, `evolucaoCriadas`, `evolucaoAtualizadas`, `evolucaoUsuario`, `diagnosticosCriados`, `diagnosticosAtualizados`

**Referências NeoAgenda em `Organizacao` (relações a remover):**
- `pacientes`, `agendamentos`, `recorrenciasAgendamentos`, `prontuarios`, `anamneses`, `atendimentos`, `evolucoes`, `diagnosticos`

### O que precisa ficar (intocável)
- `User`, `Session`, `Account`, `Verification` — obrigatórios para o better-auth
- Campo `organizacaoId` do `User` — referenciado em `auth.ts` e `UserRepository.ts`
- Campos `displayName` e `onboardingCompleted` do `User` — usados no onboarding

### Dependência: código UI existente
`src/app/(private)/pacientes/` e outros componentes podem referenciar modelos NeoAgenda. Este PR trata **apenas do schema**. Erros de compilação TypeScript em código UI são esperados e serão tratados em PR separado de limpeza da camada de apresentação.

---

## Especificação dos Novos Modelos

> **Convenção:** todos os nomes de modelos, campos e enums seguem o padrão **português (pt-BR)**, alinhado ao AGENTS.md e ao schema existente (`Organizacao`, `criadoEm`, `atualizadoEm`, `deletadoEm`).

### Enums

| Enum | Valores |
|------|---------|
| `PlanoOrganizacao` | `GRATUITO`, `PREMIUM`, `EMPRESARIAL` |
| `TipoVeiculo` | `BAU`, `TANQUE`, `GRADE_BAIXA`, `REFRIGERADO`, `OUTRO` |
| `TipoManutencao` | `TROCA_OLEO`, `PNEU`, `FREIOS`, `FILTRO`, `SUSPENSAO`, `ELETRICA`, `OUTRO` |
| `CategoriaDespesa` | `IMPOSTOS`, `TELEFONE`, `ALUGUEL`, `SEGURO`, `OUTRO` |

### Modelos de Negócio

#### `Veiculo` → `@@map("veiculos")`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String @id` | uuid via `@default(uuid())` |
| `placa` | `String` | Placa do veículo; unique por org via `@@unique([placa, organizacaoId])` |
| `modelo` | `String` | Modelo do veículo (ex: "Scania R450") |
| `marca` | `String?` | Fabricante (ex: "Scania") |
| `ano` | `Int?` | Ano de fabricação |
| `capacidadeCargaKg` | `Float?` | Capacidade máxima de carga em kg |
| `tipo` | `TipoVeiculo?` | Tipo do veículo (enum) |
| `organizacaoId` | `String` | FK para `Organizacao` |
| `criadoEm` | `DateTime @default(now())` | |
| `atualizadoEm` | `DateTime @updatedAt` | |
| `deletadoEm` | `DateTime?` | Soft delete |

#### `Frete` → `@@map("fretes")`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String @id` | uuid |
| `veiculoId` | `String` | FK para `Veiculo` (obrigatório) |
| `origem` | `String` | Cidade/local de origem |
| `destino` | `String` | Cidade/local de destino |
| `distanciaKm` | `Float?` | Distância calculada em km |
| `pesoCargaKg` | `Float?` | Peso da carga em kg |
| `tipoCarga` | `String?` | Tipo de carga (texto livre por ora) |
| `valor` | `Decimal @db.Decimal(10, 2)` | Valor cobrado pelo frete |
| `valorMinimoAntt` | `Decimal? @db.Decimal(10, 2)` | Valor mínimo ANTT calculado — armazenado para auditoria |
| `data` | `DateTime @db.Date` | Data de realização do frete |
| `observacoes` | `String? @db.Text` | Observações livres |
| `organizacaoId` | `String` | FK para `Organizacao` |
| `criadoEm` | `DateTime @default(now())` | |
| `atualizadoEm` | `DateTime @updatedAt` | |
| `deletadoEm` | `DateTime?` | Soft delete |

#### `RegistroAbastecimento` → `@@map("registros_abastecimento")`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String @id` | uuid |
| `veiculoId` | `String` | FK para `Veiculo` |
| `data` | `DateTime @db.Date` | Data do abastecimento |
| `litros` | `Float` | Quantidade em litros |
| `valor` | `Decimal @db.Decimal(10, 2)` | Valor total pago (R$) |
| `precoPorLitro` | `Decimal? @db.Decimal(10, 4)` | R$/litro (calculado e armazenado para histórico) |
| `local` | `String?` | Nome/local do posto |
| `organizacaoId` | `String` | FK para `Organizacao` |
| `criadoEm` | `DateTime @default(now())` | |
| `atualizadoEm` | `DateTime @updatedAt` | |
| **SEM** `deletadoEm` | — | Registro imutável por design (AGENTS.md) |

#### `RegistroManutencao` → `@@map("registros_manutencao")`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String @id` | uuid |
| `veiculoId` | `String` | FK para `Veiculo` |
| `tipo` | `TipoManutencao` | Tipo da manutenção (enum) |
| `data` | `DateTime @db.Date` | Data em que foi realizada |
| `valor` | `Decimal @db.Decimal(10, 2)` | Custo da manutenção |
| `oficina` | `String?` | Nome da oficina |
| `descricao` | `String? @db.Text` | Descrição livre |
| `dataProximaManutencao` | `DateTime? @db.Date` | Próxima manutenção programada |
| `organizacaoId` | `String` | FK para `Organizacao` |
| `criadoEm` | `DateTime @default(now())` | |
| `atualizadoEm` | `DateTime @updatedAt` | |
| `deletadoEm` | `DateTime?` | Soft delete |

#### `DespesaGeral` → `@@map("despesas_gerais")`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String @id` | uuid |
| `descricao` | `String` | Descrição da despesa |
| `categoria` | `CategoriaDespesa` | Categoria (enum) |
| `valor` | `Decimal @db.Decimal(10, 2)` | Valor da despesa |
| `data` | `DateTime @db.Date` | Data da despesa |
| `recorrente` | `Boolean @default(false)` | Se é despesa recorrente |
| `veiculoId` | `String?` | FK para `Veiculo` (opcional) |
| `organizacaoId` | `String` | FK para `Organizacao` |
| `criadoEm` | `DateTime @default(now())` | |
| `atualizadoEm` | `DateTime @updatedAt` | |
| `deletadoEm` | `DateTime?` | Soft delete |

### Adaptações em Modelos Existentes

#### `Organizacao`
- Remover relações NeoAgenda (8 relações)
- Adicionar campo: `plano PlanoOrganizacao @default(GRATUITO)`
- Adicionar relações MeuCargueiro: `veiculos Veiculo[]`, `fretes Frete[]`, `registrosAbastecimento RegistroAbastecimento[]`, `registrosManutencao RegistroManutencao[]`, `despesasGerais DespesaGeral[]`

#### `User`
- Remover 9 relações NeoAgenda (anamneses, atendimentos, evolucoes, diagnosticos e variantes de auditoria)
- Manter: `organizacaoId`, `displayName`, `onboardingCompleted`, relações better-auth (`sessions`, `accounts`)

---

## Implementation Steps

### Step 1: Limpar schema — remover NeoAgenda

**Files:** `prisma/schema.prisma`

**What:** Remover todos os 7 modelos de negócio NeoAgenda e seus 17 enums associados. Adaptar o modelo `User` removendo todas as relations NeoAgenda. Adaptar o modelo `Organizacao` removendo suas relations NeoAgenda e adicionando o campo `plano PlanoOrganizacao @default(FREE)`. Adicionar o novo enum `PlanoOrganizacao`.

O schema ao final deste step conterá apenas: `User`, `Session`, `Account`, `Verification`, `Organizacao` (adaptada), e o enum `PlanoOrganizacao`.

**Testing:** `pnpm prisma validate` deve passar sem erros de syntax ou referência.

---

### Step 2: Adicionar enums e modelos MeuCargueiro

**Files:** `prisma/schema.prisma`

**What:** Adicionar os 3 enums de negócio restantes (`TipoVeiculo`, `TipoManutencao`, `CategoriaDespesa`) e os 5 novos modelos de negócio (`Veiculo`, `Frete`, `RegistroAbastecimento`, `RegistroManutencao`, `DespesaGeral`) com todos os campos em português, relações e índices conforme a especificação acima. Adicionar também as relations correspondentes em `Organizacao`.

Índices obrigatórios por modelo:
- `Veiculo`: `@@unique([placa, organizacaoId])`, `@@index([organizacaoId])`
- `Frete`: `@@index([organizacaoId, data])`, `@@index([veiculoId])`
- `RegistroAbastecimento`: `@@index([organizacaoId])`, `@@index([veiculoId])`
- `RegistroManutencao`: `@@index([organizacaoId])`, `@@index([veiculoId])`
- `DespesaGeral`: `@@index([organizacaoId])`, `@@index([veiculoId])`

**Testing:** `pnpm prisma validate` deve passar. `pnpm prisma format` deve reformatar sem erros.

---

### Step 3: Aplicar migration e regenerar client Prisma

**Files:** `prisma/migrations/` (auto-gerado), `generated/prisma/` (auto-gerado)

**What:** Como este é ambiente de desenvolvimento e o banco NeoAgenda não tem dados produtivos:

1. `pnpm prisma migrate reset --force` — dropa todas as tabelas e migrations existentes
2. `pnpm prisma migrate dev --name refatoracao-schema-meucargo` — cria e aplica nova migration
3. `pnpm prisma generate` — regenera o client Prisma em `generated/prisma/`

> ⚠️ **Atenção pós-migration**: O TypeScript apresentará erros de compilação em código UI que ainda referencia modelos NeoAgenda (ex: `src/app/(private)/pacientes/`). Esses erros são **esperados e fora do escopo** deste PR — serão resolvidos em um PR dedicado de limpeza da camada de apresentação.

**Testing:**
- `pnpm prisma studio` deve exibir as tabelas: `organizacoes`, `veiculos`, `fretes`, `registros_abastecimento`, `registros_manutencao`, `despesas_gerais`, mais as tabelas better-auth
- Verificar relações: Veiculo → Organizacao, Frete → Veiculo + Organizacao, etc.
- Queries de exemplo no Studio para confirmar que `@@unique` e `@@index` estão criados corretamente
