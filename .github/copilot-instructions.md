# Copilot Instructions for MeuCargueiro

> **Nota:** Este arquivo orienta o comportamento do GitHub Copilot / assistente AI para este repositório.

## 1. Direcionamento principal
- Sempre **consulte e siga** as regras definidas em `#file:AGENTS.md`.
- O guia em `AGENTS.md` é a fonte autoritativa para:
  - arquitetura e camadas do projeto
  - padrões de código (TypeScript, imports, naming)
  - convenções de testes, commits e branches
  - segurança e multi-tenancy
  - mensagens de erro em pt-BR

## 2. Como responder e gerar código
- Use **Português (pt-BR)** para *tudo* que for mostrado para o usuário final (erros, labels, texto UI, docs).
- Mantenha o **código em inglês** (identificadores, nomes de arquivos, variáveis, comentários técnicos).
- Siga a **arquitetura de 4 camadas** (UI → Actions → Services → Repositories) e não quebre dependências entre camadas.
- Use sempre o padrão de validação com Zod e trate erros com mensagens amigáveis em pt-BR.

## 3. Onde procurar informações
- Para dúvidas de estilo, padrões e fluxo de trabalho: `#file:AGENTS.md`
- Para padrões de teste e mocks: `#file:tests/setup.ts` e `#file:tests/mocks/*`

## 4. Lembrete rápido
Se tiver que mudar regras de processo ou adicionar recomendações, atualize `#file:AGENTS.md`.
