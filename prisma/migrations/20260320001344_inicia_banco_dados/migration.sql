-- CreateEnum
CREATE TYPE "PlanoOrganizacao" AS ENUM ('GRATUITO', 'PREMIUM', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "TipoVeiculo" AS ENUM ('BAU', 'TANQUE', 'GRADE_BAIXA', 'REFRIGERADO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoManutencao" AS ENUM ('TROCA_OLEO', 'PNEU', 'FREIOS', 'FILTRO', 'SUSPENSAO', 'ELETRICA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "CategoriaLancamento" AS ENUM ('FRETE', 'SERVICO', 'IMPOSTOS', 'TELEFONE', 'ALUGUEL', 'SEGURO', 'OUTRO');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "organizacaoId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plano" "PlanoOrganizacao" NOT NULL DEFAULT 'GRATUITO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT,
    "ano" INTEGER,
    "capacidadeCargaKg" DOUBLE PRECISION,
    "tipo" "TipoVeiculo",
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fretes" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION,
    "pesoCargaKg" DOUBLE PRECISION,
    "tipoCarga" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "valorMinimoAntt" DECIMAL(10,2),
    "data" DATE NOT NULL,
    "observacoes" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "fretes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_abastecimento" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "litros" DOUBLE PRECISION NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "precoPorLitro" DECIMAL(10,4),
    "local" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_abastecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_manutencao" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "tipo" "TipoManutencao" NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "oficina" TEXT,
    "descricao" TEXT,
    "dataProximaManutencao" DATE,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "registros_manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_financeiros" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "categoria" "CategoriaLancamento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" DATE NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "veiculoId" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "lancamentos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizacoes_slug_key" ON "organizacoes"("slug");

-- CreateIndex
CREATE INDEX "veiculos_organizacaoId_idx" ON "veiculos"("organizacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_organizacaoId_key" ON "veiculos"("placa", "organizacaoId");

-- CreateIndex
CREATE INDEX "fretes_organizacaoId_data_idx" ON "fretes"("organizacaoId", "data");

-- CreateIndex
CREATE INDEX "fretes_veiculoId_idx" ON "fretes"("veiculoId");

-- CreateIndex
CREATE INDEX "registros_abastecimento_organizacaoId_idx" ON "registros_abastecimento"("organizacaoId");

-- CreateIndex
CREATE INDEX "registros_abastecimento_veiculoId_idx" ON "registros_abastecimento"("veiculoId");

-- CreateIndex
CREATE INDEX "registros_manutencao_organizacaoId_idx" ON "registros_manutencao"("organizacaoId");

-- CreateIndex
CREATE INDEX "registros_manutencao_veiculoId_idx" ON "registros_manutencao"("veiculoId");

-- CreateIndex
CREATE INDEX "lancamentos_financeiros_organizacaoId_idx" ON "lancamentos_financeiros"("organizacaoId");

-- CreateIndex
CREATE INDEX "lancamentos_financeiros_veiculoId_idx" ON "lancamentos_financeiros"("veiculoId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_abastecimento" ADD CONSTRAINT "registros_abastecimento_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_abastecimento" ADD CONSTRAINT "registros_abastecimento_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_manutencao" ADD CONSTRAINT "registros_manutencao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_manutencao" ADD CONSTRAINT "registros_manutencao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
