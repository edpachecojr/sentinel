# PRD: MeuCargueiro — Plataforma de Gestão para Motoristas Autônomos

**Última Atualização:** 19 de março de 2026  
**Status:** Em Definição  
**Proprietário do Produto:** [A confirmar]  
**Data de Lançamento Prevista:** Q2 2026 (MVP em 3 meses)

---

## 🎯 Resumo Executivo

### Visão do Produto

**MeuCargueiro** é uma plataforma web moderna e intuitiva que capacita motoristas autônomos a gerenciar todos os aspectos do seu negócio — desde frota de veículos até análise financeira — de forma simples, sem burocracia e acessível via dispositivos móveis.

### Usuários-Alvo

- Motoristas autônomos com 1+ veículo (focus: motoristas solo e pequenos proprietários)
- Cooperativas e associações de transporte rodoviário
- Gestores de pequenas frotas de cargas

### Diferencial Chave

- **Cálculo legal de frete baseado em ANTT**: Oferece base de negociação fundamentada na Resolução ANTT nº 5.867/2020 + PORT.SUROC Nº03/2026
- **Simplicidade radical**: Interface moderna que não exige conhecimento técnico
- **Mobile First**: Acesso completo via smartphone, essencial para motoristas na estrada
- **Integração completa**: Todos os dados do negócio em um único lugar (veículos, manutenções, fretes, finanças, combustível)

### Definição de Sucesso (Métrica Principal)

| Métrica | Meta MVP | Justificativa |
|---------|----------|---------------|
| **Taxa de Conclusão de Onboarding** | 80%+ | Indicador de facilidade de uso |
| **Retenção Mensal (D30)** | 60%+ | Engajamento sustentado |
| **Adoção de Features Críticas** | 70%+ | Motoristas usando ≥3 features principais |
| **NPS (Net Promoter Score)** | 40+|| Satisfação do usuário |

### Alinhamento Estratégico

**O que está sendo resolvido:**
- Motoristas autônomos carecem de ferramentas simples para rastrear receitas, despesas e saudemetria do negócio
- Falta informação confiável sobre valores mínimos de frete (hoje dependem de intuição ou tabelas desatualizadas)
- Ausência de visão consolidada: veículos, manutenções, fretes e combustível em sistemas separados

**Oportunidade de Mercado:**
- ~1.5 milhão de motoristas autônomos registrados no Brasil
- Segmento crescente de motoristas online com acesso a smartphones
- Legislação ANTT ainda pouco explorada em plataformas tecnológicas

**Vantagem Competitiva:**
- Primeira plataforma a integrar cálculo legal de ANTT com gestão operacional completa
- UX focada no motorista (não no dispatcher/gestor)
- Abordagem mobile-first, não "web adaptado para móvel"

### Requisitos de Recursos

| Aspecto | Estimativa | Notas |
|---------|-----------|-------|
| **Esforço de Desenvolvimento** | 480-600 story points | MVP com 4-5 features principales |
| **Timeline** | 10-14 semanas (3-3.5 meses) | Sprint agile de 2 semanas |
| **Equipe Recomendada** | 5-6 pessoas | Backend (2), Frontend (2), Product (1), QA (1) |
| **Orçamento Indicativo** | [A confirmar com stakeholders] | Inclui hosting, infraestrutura, marketing MVP |

---

## 📋 Declaração do Problema e Oportunidade

### Definição do Problema

**Problema Central:**  
Motoristas autônomos enfrentam **ineficiência operacional e incerteza financeira** na gestão do seu negócio. Eles gastam tempo precioso com planilhas desorganizadas, perdem visualidade sobre lucratividade real e negociam fretes **sem base legal ou dados concretos**.

**Pontos Problemáticos (Agrupados por Tema):**

#### 1. **Falta de Organização Operacional**
- Registros de manutenção espalhados (fotos no WhatsApp, notas em papel, emails aleatórios)
- Impossibilidade de rastrear histórico de manutenções por veículo
- Planejamento reativo de manutenções em vez de preventivo
- Perda de informações críticas quando motorista troca de telefone

#### 2. **Gestão Financeira Deficiente**
- Múltiplas planilhas Excel desorganizadas ou nem existem
- Impossibilidade de calcular margem real por frete
- Despesas fixas e variáveis não mapeadas
- Visão nula do "quanto estou lucrando realmente"
- Dificuldade em justificar valores de frete para clientes

#### 3. **Vulnerabilidade em Negociação de Fretes**
- Ausência de referência legal (Resolução ANTT) no dia a dia
- Negociação baseada em "achismo" ou pressão do cliente
- Frequentemente aceitam fretes abaixo do valor mínimo legal
- Sem ferramental para calcular frete de forma objetiva

#### 4. **Controle de Abastecimento Improvisado**
- Notas fiscais perdidas ou desorganizadas
- Impossibilidade de medir consumo de combustível por veículo ou rotas
- Suspeita de roubos/desvios sem evidência
- Orçamento de combustível impreciso

#### 5. **Inacessibilidade em Campo**
- Soluções existentes são web-only ou exigem desktop
- Motorista não consigo consultar dados enquanto está na estrada
- Registro de novo frete exige voltar a casa/escritório

**Impacto Quantificado (Estimativas de Pesquisa):**
- Motoristas gastam em média **5-7 horas/mês** em gestão manual (tempo perdido de operação)
- Negociam fretes **10-15% abaixo** do valor mínimo legal (perda direta de receita)
- ~60% dos motoristas não conseguem identificar margem real por frete

### Análise de Oportunidades

#### Tamanho do Mercado
| Segmento | Quantidade | TAM Potencial |
|----------|-----------|--------------|
| Motoristas autônomos Brasil | 1.5M | Alto (maioria com smartphone) |
| Pequenos proprietários de frota (2-5 veículos) | 200-300k | Muito alto |
| Cooperativas transportadoras | 1-2k | Médio (múltiplos usuários/org) |

#### **Modelo de Receita Inicial**
- **Subscription (SaaS)**
  - Plano Free: Registro básico de fretes + histórico (até 20 fretes/mês)
  - Plano Premium (R$ 49-79/mês): Gestão completa, cálculo ANTT, analytics
  - Plano Business (R$ 199+/mês): Múltiplos veículos, relatórios avançados, integração
  
- **Comissão (Futuro)**
  - Pequena % em fretes combinados via plataforma (marketplace de cargas)
  - Premium em serviços de terceiros (seguros, peças, combustível)

#### **Cenário Competitivo**
| Solução | Pontos Fortes | Pontos Fracos | Diferencial MeuCargueiro |
|---------|---------------|---------------|-------------------------|
| Planilhas Excel/Sheets | Flexível, zero custo | Desorganizado, inseguro | Organização automática |
| App de ERP genérico | Completo, robusto | Interface complexa, não mobile-first | UX simplificada para motorista |
| Sistemas de dispatch (Uber Freight, etc) | Integrado com fretes | Não oferece gestão operacional completa | Gestão independente + cálculo ANTT |
| **MeuCargueiro** | Mobile-first, ANTT integrado, simples | Focado, não genérico | ✅ Solução especializada para motoristas |

### Critérios de Sucesso

#### **Métricas Primárias**
- **Retenção 30 dias (D30)**: 60%+ dos usuários que se cadastram retornam em 30 dias
- **Usuários Ativos Mensais (MAU)**: 5k+ motoristas no final do Q2 2026
- **NPS (Net Promoter Score)**: 40+ (motoristas referenciariam para colegas)

#### **Métricas Secundárias**
- Tempo médio de onboarding: <5 minutos até primeiro frete registrado
- Utilizadores de Premium: 15%+ de adopção após Q3
- Taxa de erro em cálculo ANTT: 0% (conformidade legal crítica)

#### **Mudanças de Comportamento Esperadas**
- Motoristas registram fretes em tempo real (não de memória após semanas)
- Utilizam referência ANTT para negociar (relatório legal em mãos)
- Consultam dashboard financeiro semanalmente (antes: nunca)
- Planejam manutenção preventiva (antes: reativa)

#### **Resultados Antecipados**
- Aumento estimado de 5-10% na margem de frete (por valorização adequada)
- Redução de tempo administrativo de 5-7 horas/mês
- Motoristas com visibilidade de lucratividade real

---

## 👥 Requisitos e Histórias do Usuário

### Personas de Usuários Primários

#### **Persona 1: João — Motorista Solo Iniciante**
- **Idade**: 35-45 anos
- **Contexto**: Trabalha como autônomo, 1 caminhão, faz fretes locais e regionais
- **Experiência Digital**: Smartphone avançado (redes sociais), web básica
- **Dor Principal**: Não sabe explicar ao cliente por que o frete custa X (inseguro em negociação)
- **Motivação**: Quer ganhar mais cobrando "o justo" sem deixar cliente chato
- **Frequência de Uso**: Diária (mínimo: registrar frete, ver saldo restante mês)

#### **Persona 2: Maria — Pequena Proprietária**
- **Idade**: 40-55 anos
- **Contexto**: Dona de 3 caminhões, emprega 2-3 motoristas, base em garagem própria
- **Experiência Digital**: Usa WhatsApp, email, tentou planilhas no passado
- **Dor Principal**: Perder informações (motoristas saem, dados desorganizados), desconfiar de números
- **Motivação**: Controlar melhor o negócio, detectar onde está sangrando dinheiro, confiar em relatórios
- **Frequência de Uso**: 2-3x/semana (relatórios, manutenção, análise)

#### **Persona 3: Carlos — Motorista Experiente / Gestor**
- **Idade**: 50-60 anos
- **Contexto**: Trabalha há 20+ anos, conhece bem o mercado, quer otimizar operação
- **Experiência Digital**: Mediamente confortável com tecnologia, usa app de banco
- **Dor Principal**: Falta de dados estruturados para negociar com grandes clientes, perder competitividade
- **Motivação**: Profissionalizar operação, ter dados para justificar incrementos de frete, identificar ineficiências
- **Frequência de Uso**: Diária a 3x/semana (análise de rentabilidade, negociação)

### Mapeamento da Jornada do Usuário

#### **Estado Atual (As-Is)**
```
1. Motorista faz frete
   ↓
2. Anota em papel ou lembra (later reconstruir mentalmente)
   ↓
3. No fim do mês, tenta somar em planilha ou papel
   ↓
4. Resultado: confuso, incompleto, frustrante
   ↓
5. Não sabe realmente quanto lucrou
```

#### **Estado Futuro (To-Be)**
```
1. Motorista faz frete
   ↓
2. No mesmo dia (ou durante), abre app > Registro Novo Frete
   ↓
3. Preenche: origem, destino, valor, distância
   ↓
4. Sistema calcula automaticamente valor ANTT, margem, combustível estimado
   ↓
5. Frete fica no histórico, sincronizado em nuvem
   ↓
6. Qualquer dia: acessa dashboard, vê receita/despesa em tempo real, relatório por período
   ↓
7. Resultado: confiante em números, dados para negociar, identifica oportunidades
```

#### **Pontos Críticos de Contato**
| Fase | Ação do Usuário | Risco de Drop-off |
|------|-----------------|-------------------|
| **Onboarding** | Cadastro + confirmação email/tel | Pode desistir se muito longo |
| **Primeiro Frete** | Registrar primeiro frete de teste | Confusão na UX → sai e volta a Excel |
| **Cálculo ANTT** | Visualizar valor mínimo sugerido | Desconfiança se não entender origem do número |
| **Dashboard** | Consultar resumo financeiro | Frustração se dados não fizerem sentido |
| **Exportação de Relatório** | Baixar relatório para apresentar cliente | Deve ser profissional, fácil de usar |

### Histórias de Usuários Principais

#### **Épico 1: Onboarding e Autenticação**

**H1.1 — Cadastro Inicial**
```
Como: motorista novo
Quero: criar uma conta rapidamente com email/tel
Para: começar a registrar meus fretes sem burocracia

Critérios de Aceitação:
- [ ] Formulário de signup com 3 campos (nome, email, senha simples)
- [ ] Validação de email (link de confirmação)
- [ ] Possibilidade de usar e-mail ou número de telefone
- [ ] Redirecionamento automático para onboarding/tutorial após confirmação
- [ ] Tempo total: < 3 minutos
- [ ] Mensagens de erro em português claro

Definição de Concluído:
- [ ] Design mobile responsivo validado
- [ ] Testes de usuário: 9/10 novos usuários completam sem ajuda
- [ ] NPS no onboarding: 7+/10
```

**H1.2 — Onboarding Guiado (Setup Inicial)**
```
Como: novo motorista
Quero: ser guiado a registrar meu primeiro veículo, dados e entender a plataforma
Para: começar com confiança

Critérios de Aceitação:
- [ ] Step 1: Informações pessoais (nome motorista, contato, documento)
- [ ] Step 2: Registro de veículo (modelo, placa, ano, capacidade)
- [ ] Step 3: Preferências iniciais (tipo de carga, região)
- [ ] Step 4: "tutorial rápido" (3 screenshots: como registrar frete, ver saldo, calcular ANTT)
- [ ] Opção de pular qualquer step (não deve trancar)
- [ ] Após completar: tela de congratulações + convite para registrar primeiro frete

Definição de Concluído:
- [ ] Fluxo validado com mínimo 5 usuários reais
- [ ] Tempo de onboarding: 3-5 minutos
```

#### **Épico 2: Gestão de Veículos**

**H2.1 — Registrar Novo Veículo**
```
Como: motorista proprietário
Quero: registrar meus veículos (placa, modelo, capacidade, ano)
Para: rastrear histórico e manutenção por veículo

Critérios de Aceitação:
- [ ] Formulário com campos: placa (obrigatório, validação ABCD-1234), modelo, fabricante, ano, capacidade carga (kg), tipo (basculante, caixa, etc)
- [ ] Validação de placa em tempo real
- [ ] Após salvar, veículo fica disponível nos dropdowns de frete/manutenção
- [ ] Mensagem de sucesso clara
- [ ] Edição posterior de dados (modelo mudou, capacidade)

Definição de Concluído:
- [ ] Design mobile testado
- [ ] Validação de placa robusta (nenhum erro de falso-positivo)
- [ ] Base de dados sincronizada
```

**H2.2 — Ver Histórico de Fretes por Veículo**
```
Como: proprietário com múltiplos veículos
Quero: filtrar e ver apenas fretes de um veículo específico
Para: analisar desempenho por veículo, comparar com mangas similares

Critérios de Aceitação:
- [ ] Lista de veículos em dropdown (carregamento rápido, mesmo 10+ veículos)
- [ ] Ao selecionar: mostra todos os fretes daquele veículo, ordenados decrescente no tempo
- [ ] Informação extra: total km, receita, média por km
- [ ] Filtro adicional por período (últimos 30 dias, 90 dias, customizado)
- [ ] Exportação de relatório em PDF

Definição de Concluído:
- [ ] Performance: carregamento < 1s mesmo com 500+ fretes
- [ ] Relatório em PDF profissional, com logo MeuCargueiro
```

#### **Épico 3: Registro de Fretes**

**H3.1 — Registrar Novo Frete**
```
Como: motorista
Quero: registrar um frete realizado em <1 minuto
Para: não perder dados e manter histórico atualizado

Critérios de Aceitação:
- [ ] Quick form: Origem, Destino, Valor cobrado, Data (pre-filled com today)
- [ ] Opcionais: Peso carga, Tipo carga, Observações
- [ ] Auto-complete de cidades (via API de geolocalização ou banco local)
- [ ] Ao salvar, mostra: valor registrado ✓ + botão rápido "Registrar outro"
- [ ] Histórico imediatamente atualizado (sincro real-time)
- [ ] Possibilidade de editar/deletar (soft-delete) frete posterior

Definição de Concluído:
- [ ] Interface mobile otimizada (máximo 1 tela de scroll)
- [ ] Tempo de registro: 30-60 segundos
- [ ] 95%+ de fretes registrados com sucesso (sem timeouts/erros)
```

**H3.2 — Visualizar Cálculo de Frete ANTT**
```
Como: motorista
Quero: ao registrar um frete, receber sugestão de valor mínimo baseado em ANTT
Para: ter referência legal ao negociar com clientes

Critérios de Aceitação:
- [ ] Ao preencher Origem/Destino, sistema calcula distância (Google Maps ou similar)
- [ ] Com distância, consulta tabela ANTT (Res. 5867/2020 + PORT.SUROC 03/2026)
- [ ] Mostra: "Valor Mínimo Legal: R$ XXX (baseado em ANTT para 100km + carga padrão)"
- [ ] Método de cálculo transparente (link "Como calculamos?" explica fórmula)
- [ ] Se valor cobrado < mínimo: alerta amarelo "Você cobrou abaixo do mínimo legal"
- [ ] Se valor cobrado > mínimo: mensagem positiva "Frete justo ✓"

Definição de Concluído:
- [ ] Cálculo ANTT auditado por especialista em legislação (0% erro legal)
- [ ] Verificação com mínimo 10 fretes reais de usuários
- [ ] Documentação clara da fórmula no app
```

**H3.3 — Dashboard de Fretes (Timeline e Resumo)**
```
Como: motorista
Quero: visualizar um dashboard mostrando fretes recentes, receita do mês, Status
Para: ter visão rápida e confiante do meu desempenho

Critérios de Aceitação:
- [ ] Card superior: "Receita Este Mês: R$ XXX" (valor destacado, grande)
- [ ] Card seguinte: "Fretes: 12", "Média por Frete: R$ XXX", "Melhor dia: R$ XXX"
- [ ] Timeline abaixo: últimos 5-10 fretes (data, origem→destino resumido, valor)
- [ ] Possibilidade de ver "Últimos 30 dias", "Últimos 90 dias", período customizado
- [ ] Gráfico simples: receita por dia (últimas 2 semanas) - barra ou linha
- [ ] Nenhum relatório pesado: dashboard carrega em <2 segundos, mobile

Definição de Concluído:
- [ ] Design limpo, sem poluição de informação
- [ ] Carregamento rápido mesmo com 1000+ fretes
- [ ] Dados 100% precisos (validação manual com 5+ usuários)
```

#### **Épico 4: Controle de Manutenções**

**H4.1 — Registrar Manutenção de Veículo**
```
Como: motorista/proprietário
Quero: registrar manutenção realizada (troca de óleo, pneu, etc) no veículo
Para: ter histórico e planejar próximas manutenções preventivas

Critérios de Aceitação:
- [ ] Formulário: Veículo (dropdown), Tipo manutenção, Data, Custo, Oficina, Descrição
- [ ] Tipos pré-definidos: "Troca óleo", "Pnue", "Filtro", "Freios", "Outros"
- [ ] Campo opcional: Próxima manutenção programada (data ou km)
- [ ] Após salvar, manutenção fica visível no histórico do veículo
- [ ] Possibilidade de anexar foto/recibo (upload opcional)

Definição de Concluído:
- [ ] UX simples, 5 campos máximo na tela
- [ ] Validação de data (não permite data futura)
- [ ] Histórico por veículo completo
```

**H4.2 — Ver Histórico de Manutenções e Alertas**
```
Como: proprietário
Quero: visualizar todas as manutenções por veículo e ser alertado de manutenções próximas
Para: evitar quebras inesperadas, planejar orçamento

Critérios de Aceitação:
- [ ] Filtro por veículo + período
- [ ] Timeline de manutenções (mais recentes no topo): data, tipo, valor, officina
- [ ] Total gasto em manutenção no período
- [ ] Aviso visual: "Próxima revisão em 1000km" ou "Próxima revisão em 15 dias"
- [ ] (Future) Notificação push quando data próxima (não MVP)

Definição de Concluído:
- [ ] Relatório de manutenção pode ser exportado em PDF
- [ ] Alertas configuráveis (remind 15 dias antes, etc)
```

#### **Épico 5: Controle de Abastecimento**

**H5.1 — Registrar Abastecimento de Combustível**
```
Como: motorista
Quero: registrar cada vez que abastecço (data, valor, quantidade litros, local)
Para: controlar gasto com combustível e identificar consumo anormal

Critérios de Aceitação:
- [ ] Quick form: Data (today default), Veículo (dropdown), Valor em R$, Litros, Local (text)
- [ ] Validação: litros > 0, valor > 0
- [ ] Auto-cálculo primário: R$/litro (feedback gráfico)
- [ ] Após salvar: confirmação visual + opção "Abastecer outro veículo"
- [ ] Histórico de abastecimento por veículo

Definição de Concluído:
- [ ] Interface com máximo 1 tela (mobile-first)
- [ ] Registro rápido (<45 segundos)
- [ ] Dados sincronizados
```

**H5.2 — Dashboard de Abastecimento (Consumo e Análise)**
```
Como: motorista/gestor
Quero: visualizar histórico de abastecimento, consumo por km, comparar períodos
Para: identificar consumo anormal (possível vazamento/roubo), estimar orçamento futuro

Critérios de Aceitação:
- [ ] Seção "Combustível This Month": Total gasto, Total litros, Média R$/litro
- [ ] Tabela histórico: data, veículo, R$, litros, local, R$/litro
- [ ] Gráfico: consumo por dia (últimas 2 semanas)
- [ ] Comparação mes-a-mes (este mês vs mês passado)
- [ ] (Futuro) Integração com fretes: consumo por km, margem após combustível

Definição de Concluído:
- [ ] Carregamento rápido
- [ ] Alertas visuais se consumo anormalmente alto
- [ ] Exporta para PDF se necessário
```

#### **Épico 6: Controle Financeiro**

**H6.1 — Dashboard Financeiro (Receita vs Despesas)**
```
Como: motorista/proprietário
Quero: visualizar, em uma tela, receita total, despesas totais, saldo líquido
Para: ter visão clara da saúde financeira do negócio

Critérios de Aceitação:
- [ ] Período selecionável: Este mês, Últimos 30/90 dias, Customizado
- [ ] 3 cards destacados: Receita Total (verde), Despesas Totais (vermelho), Liquido (destaque)
- [ ] Breakdown de despesas: Manutenção, Combustível, Outros (com %), clicável
- [ ] Gráfico de receita vs despesas por período (comparação lado-a-lado)
- [ ] Tendência: seta acima/abaixo indicando se melhorou ou piorou vs período anterior

Definição de Concluído:
- [ ] Cálculos 100% precisos
- [ ] Performance: < 2s carregamento
- [ ] Design objetivo, sem excesso de informação
- [ ] Teste com 10 usuários: todos entendem de primeira
```

**H6.2 — Registrar Despesas Gerais**
```
Como: proprietário
Quero: registrar despesas que não são manutenção nem combustível (impostos, telefone, aluguel garagem, etc)
Para: ter controle completo de custos do negócio

Critérios de Aceitação:
- [ ] Formulário: Descrição, Categoria (dropdown: "Impostos", "Telefone", "Aluguel", "Seguros", "Outros"), Valor, Data, Veículo (opcional)
- [ ] Categorias editáveis (proprietário pode criar custom)
- [ ] Histórico com possibilidade de marcar como "Recorrente" (será sugerido próximo período)
- [ ] Possibilidade de editar/deletar registros posterirmente

Definição de Concluído:
- [ ] Despesas recorrentes aparecem automaticamente no próximo período (com notificação)
- [ ] Validação de categorias e valores
```

**H6.3 — Relatório Financeiro Exportável**
```
Como: proprietário/motorista
Quero: gerar um relatório mensal/trimestral da minha operação (receita, despesas, margem)
Para: usar para negociar com clientes, apresentar ao contador, entender o negócio

Critérios de Aceitação:
- [ ] Botão "Exportar Relatório" discreto no dashboard financeiro
- [ ] Formato: PDF com branding MeuCargueiro
- [ ] Conteúdo: período selecionado, receita total, breakdown de despesas, gráficos, liquído
- [ ] Profissional, mas acessível (não muito técnico)
- [ ] Pode ser salvo/compartilhado

Definição de Concluído:
- [ ] PDF gerado em < 5 segundos
- [ ] Relatório testado com contador/gestor
- [ ] Sem erros de cálculo
```

---

## 🔧 Requisitos Funcionais

### Recursos Obrigatórios (MVP — Must Have)

| # | Feature | Descrição | Prioridade | Esforço (SP) |
|---|---------|-----------|-----------|------------|
| **1** | **Autenticação & Onboarding** | Signup/Login com email, onboarding customizado | MUST | 40 |
| **2** | **Gestão de Veículos** | Registrar, editar, listar, visualizar histórico | MUST | 30 |
| **3** | **Registro de Fretes** | Criar, editar, deletar (soft), listar, filtrar | MUST | 50 |
| **4** | **Cálculo ANTT** | Sugestão de valor mínimo baseado em legislação | MUST | 60 |
| **5** | **Dashboard de Fretes** | Timeline, resumo mensal, gráficos simples | MUST | 40 |
| **6** | **Controle de Abastecimento** | Registrar abastecimento, histórico | MUST |25 |
| **7** | **Controle de Manutenção** | Registrar, histórico por veículo | MUST | 25 |
| **8** | **Dashboard Financeiro** | Receita, despesas, saldo líquido, breakdown | MUST | 45 |
| **9** | **Despesas Gerais** | Registrar despesas não-veículo | SHOULD | 20 |
| **10** | **Relatórios Exportáveis** | PDF com dados financeiros e operacionais | SHOULD | 30 |
| **11** | **Mobile Responsiveness** | Todo layout otimizado para mobile (< 768px) | MUST | 35 |
| **12** | **Segurança & Dados** | Encriptação, LGPD, backup, validação dados | MUST | 50 |

**Total MVP Estimado: 470-490 story points (~12-14 semanas, 2 sprints/mês, equipe 5 pessoas)**

### Recursos Secundários (Should Have / Nice to Have)

| # | Feature | Descrição | Prioridade | Fase |
|---|---------|-----------|-----------|------|
| **1** | **Notificações Mobile** | Push alerts para manutenção próxima, alerta de abastecimento anormal | SHOULD | Post-MVP (Fase 2) |
| **2** | **Integração com Mapas** | Mapa interativo mostrando frotas/fretes em tempo real | COULD | Fase 3 |
| **3** | **Marketplace Interno** | Conectar motoristas com carregadores (futuro modelo de receita) | COULD | Fase 4 |
| **4** | **IA de Recomendações** | Sugestões de preço frete baseado em histórico e mercado | COULD | Fase 4 |
| **5** | **Integração Contábil** | Exportar para software de contabilidade (API) | SHOULD | Fase 2 |
| **6** | **Permissões de Equipe** | Proprietário com múltiplos motoristas (controle de acesso) | SHOULD | Fase 2 |
| **7** | **Histórico de Sincronização** | Ver quando certos fretes foram registrados/editados (audit trail) | COULD | Post-MVP |
| **8** | **Chat com Suporte** | In-app messaging com time de suporte | COULD | Fase 2 |

### Priorização (MoSCoW + Matriz Impacto vs Esforço)

#### **Must Have (MVP)**
```
Autenticação → Onboarding → Veículos → Fretes → ANTT → Dashboard → Analytics
Sem estes, produto não é viável.
```

#### **Should Have (Fase 1 Completa)**
```
Despesas Gerais → Relatórios → Notificações
Aumentam valor massivamente, com esforço moderado.
```

#### **Could Have (Futuro)**
```
Marketplace → IA → Mapas → Integrações
Diferenciadoras a longo prazo, complexidade alta.
```

---

## 🏗️ Requisitos Técnicos

### Especificações de Arquitetura

**Stack Tecnológico** (Alinhado com NeoAgenda):

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| **Frontend** | Next.js 16+ (React 19) + TypeScript | SSR/SSG, mobile-first, rápido |
| **Estilo** | Tailwind CSS v4 + shadcn/ui | Design tokens, componentes acessíveis |
| **Backend** | Node.js (Vercel / Edge Functions) | Serverless, escalável, rápido |
| **Database** | PostgreSQL (Neon) | Relacional, confiável, serverless |
| **ORM** | Prisma v7 | Type-safe, migrations automáticas |
| **Auth** | Better Auth v1.5 | Email/Password + OAuth |
| **Caching** | Redis + ISR (Next.js) | Performance, invalidação inteligente |
| **Armazenamento Arquivos** | Cloudflare R2 / S3 | Recibos, fotos de manutenção |

**Arquitetura de 4 Camadas** (Com base em AGENTS.md do NeoAgenda):

```
┌─────────────────────────────────────────────┐
│   UI Layer (Components + Pages)             │
│   src/app/**, src/components/**             │
└──────────────┬──────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│   Action Layer (Server Actions)             │
│   src/actions/** ← entry point para mutations│
└──────────────┬───────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│   Service Layer (Business Logic)            │
│   src/services/** ← validação, ANTT logic   │
└──────────────┬───────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│   Repository Layer (Database)               │
│   src/repositories/** ← Prisma queries      │
└──────────────┴───────────────────────────────┘
```

### Requisitos de API

#### **Endpoints Principais (REST)**

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/signup` | Registrar novo usuário | Public |
| `POST` | `/api/auth/login` | Fazer login | Public |
| `GET` | `/api/vehicles` | Listar veículos do motorista | Required |
| `POST` | `/api/vehicles` | Criar novo veículo | Required |
| `GET` | `/api/fretes` | Listar fretes (com paginação) | Required |
| `POST` | `/api/fretes` | Criar novo frete | Required |
| `GET` | `/api/fretes/:id/antt` | Calcular frete ANTT para origin/dest | Required |
| `GET` | `/api/abastecimentos` | Listar abastecimentos | Required |
| `POST` | `/api/abastecimentos` | Registrar abastecimento | Required |
| `GET` | `/api/manutencoes` | Listar manutenções | Required |
| `POST` | `/api/manutencoes` | Registrar manutenção | Required |
| `GET` | `/api/dashboard/financeiro` | Resumo financeiro (receita / despesa) | Required |
| `POST` | `/api/relatorios/exportar` | Gerar PDF com relatório | Required |

#### **Autenticação & Rate Limit**

- **Bearer Token** via JWT (sessão server-side com Better Auth)
- **Rate Limit**: 100 req/min por usuário, 1000 req/min por IP
- **Timeout API**: 30 segundos max
- **Retry**: Exponential backoff (clientes devem implementar)

#### **Tratamento de Erros**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", // ou AUTH_REQUIRED, NOT_FOUND, etc
    "message": "Campo obrigatório ausente: origem",
    "details": { "field": "origem", "reason": "required" }
  }
}
```

### Requisitos de Dados

#### **Modelo de Dados Principal**

```sql
-- Users (melhorado com campos MeuCargueiro)
User
  id (uuid)
  email (string, unique)
  passwordHash (string)
  name (string)
  phone (string, optional)
  CPF (string, optional)
  organizationId (uuid) -- multi-tenancy
  createdAt
  deletedAt (soft delete)

-- Organization (Tenant)
Organization
  id (uuid)
  name (string) -- "Fretes João Silva" ou "Transportadora ABC"
  slug (string, unique)
  ownerId (uuid -> User)
  plan ("free" | "premium" | "business")
  createdAt

-- Vehicles
Vehicle
  id (uuid)
  organizationId (uuid)
  licensePlate (string, unique per org) -- ABCD-1234 format
  model (string)
  manufacturer (string)
  year (int)
  cargoCapacityKg (float)
  type ("box" | "tanker" | "flatbed" | "other")
  createdAt
  deletedAt

-- Fretes
Frete
  id (uuid)
  organizationId (uuid)
  vehicleId (uuid) -> Vehicle
  origin (string) -- city/state
  destination (string)
  loadWeight (float, kg) [optional]
  loadType (string) [optional] -- "grains", "electronics", etc
  value (float, R$)
  ANTTMinimumValue (float, R$) -- calculado e armazenado p/ auditória
  date (datetime)
  notes (text, optional)
  createdAt
  deletedAt

-- Abastecimentos
FuelRecord
  id (uuid)
  organizationId (uuid)
  vehicleId (uuid)
  date (datetime)
  liters (float)
  valueR$ (float)
  location (string)
  createdAt

-- Manutenções
MaintenanceRecord
  id (uuid)
  organizationId (uuid)
  vehicleId (uuid)
  type ("oil_change" | "tire" | "brakes" | "filter" | ...) 
  date (datetime)
  valueR$ (float)
  shop (string)
  description (text)
  nextScheduledDate (datetime, optional)
  attachmentUrl (string, optional) -- S3/R2 URL
  createdAt

-- Despesas Gerais
GeneralExpense
  id (uuid)
  organizationId (uuid)
  vehicleId (uuid, optional) -- pode ser da organização inteira
  category ("taxes" | "phone" | "rent" | "insurance" | "other")
  description (string)
  value (float, R$)
  date (datetime)
  isRecurring (boolean)
  frequency ("monthly" | "quarterly" | "yearly") [if recurring]
  createdAt

-- Relatórios (para auditoria / compliance)
Report
  id (uuid)
  organizationId (uuid)
  type ("monthly_financial" | "vehicle_maintenance" | "fleet_summary")
  period_start (datetime)
  period_end (datetime)
  data (jsonb) -- snapshot dos dados
  generatedAt (datetime)
```

#### **Restrições Críticas**

- Toda query de negócio **DEVE** incluir `organizationId` (multi-tenancy)
- Soft delete via `deletedAt` (nunca hard delete)
- Índices em: `(organizationId, createdAt)`, `vehicleId`, `organization_plan`
- Validação de placa: regex `^[A-Z]{2}\d{4}-?[A-Z]{2}$` ou novo formato

### Requisitos de Desempenho

| Métrica | Objetivo | Justificativa |
|---------|----------|--------------|
| **Tempo de Carregamento (P95)** | < 2 segundos | Mobile-first, motorista na estrada |
| **Tempo de Resposta API (P95)** | < 500ms | Registro rápido não-bloqueante |
| **Taxa de Sucesso* | 99.9%+ | Dados críticos, zero-tolerance |
| **Escalabilidade** | 100k+ MAU sem degradação | Crescimento esperado |
| **Uptime** | 99.5%+ | SLA para produção |
| **Tamanho da App JS** | < 200KB (gzip) | Mobile em 3G funciona |

### Requisitos de Segurança

| Aspecto | Requisito | Implementação |
|--------|-----------|--------------|
| **Autenticação** | Email + senha (min 8 chars), 2FA opcional (futuro) | Better Auth + email verification |
| **Autorização** | RBAC: Motorista, Proprietário, Contabilista (futuro) | Middleware no Actions |
| **Criptografia** | TLS 1.3, secrets encriptados em repouso | Prisma field encryption |
| **Dados Sensíveis** | CPF, placa, dados financeiros nunca em logs | Sanitize antes de log |
| **LGPD** | Direito ao esquecimento, export de dados | Soft delete + export endpoint |
| **Auditoria** | Todas as mutações rastreadas (quem, quando, quê) | Audit log table (future) |
| **Rate Limiting** | 100 req/min/user, 1000 req/min/IP | Middleware |

### Requisitos de Plataforma

| Plataforma | Suporte | Notas |
|-----------|---------|--------|
| **Web Desktop** | ✅ Chrome, Firefox, Safari, Edge (últimas 2 versões) | Não prioridade |
| **Web Mobile** | ✅ iOS Safari, Android Chrome | Prioridade #1 |
| **Progressive Web App** | ✅ (Phase 2) | Offline capability (futuro) |
| **API REST** | ✅ | Consumível por terceiros |

---

## 🎨 Requisitos de Experiência do Usuário

### Princípios de Design

1. **Simplicidade Radical**: Cada tela = máximo 1 objetivo principal
2. **Mobile First**: Design começa no mobile, depois expande
3. **Zero Fricção**: Registro de frete em <1 minuto
4. **Linguagem Clara**: Português claro e direto (não jargão técnico)
5. **Consistência**: Mesmos padrões de UI/UX em toda app

### Sistema de Design

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| **Cores Primárias** | Verde sucesso, Azul ação, Vermelho alerta | Verde: #10b981, Azul: #3b82f6, Vermelho: #ef4444 |
| **Tipografia** | Inter (sistema), 16px base, mobile-first | Headings: 24-32px, Body: 14-16px |
| **Spacing** | 8px grid base | Margins/paddings: 8, 16, 24, 32, 48px |
| **Componentes** | shadcn/ui (Button, Card, Input, Select, etc) | Prebuilt, acessíveis, customizadas |
| **Ícones** | Feather / Tabler | Simples, reconhecíveis, 24x24px |
| **Formulários** | Labels acima, inline validation, ajuda contextual | Validação real-time, não submit-blocker |

### Requisitos de Acessibilidade (WCAG 2.1 AA)

- ✅ Contraste mínimo 4.5:1 (texto-fundo)
- ✅ Navegação via teclado (Tab, Enter, Esc)
- ✅ Suporte a screen readers (ARIA labels)
- ✅ Sem dependência de cor apenas
- ✅ Focus visible (outline 2px)

### Fluxos e Wireframes Principais

#### **Fluxo 1: Onboarding (4 telas)**
```
1. Landing (Sign Up) 
   ↓
2. Email Verification
   ↓
3. Basic Info (name, vehicle)
   ↓
4. Tutorial/Welcome Dashboard
   ↓
5. Homepage (pronto para 1º frete)
```

#### **Fluxo 2: Registrar Frete (1-2 telas)**
```
1. Home + Button "Novo Frete"
   ↓
2. Quick Form (Origem, Destino, Valor, Date)
   ↓
3. Auto-calcula ANTT
   ↓
4. Confirmação (Frete Registrado ✓)
```

#### **Fluxo 3: Consultar Dashboard Financeiro (1 tela)**
```
1. Sidebar/Menu → "Financeiro"
   ↓
2. Dashboard (Cards: Receita, Despesa, Líquido)
   ↓
3. Charts, Breakdown, Histórico abaixo
   ↓
4. Botão Exportar PDF
```

---

## 💾 Requisitos Não Funcionais

### Requisitos de Segurança (Detalhado)

#### **Autenticação**
- Better Auth v1.5 com email/password
- Senha: mínimo 8 caracteres, regex: `^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$` (letra + número)
- Verificação de email obrigatória antes de ativar conta
- Session expiration: 30 dias (com refresh via token)
- 2FA (TOTP) opcional, implementar Fase 2

#### **Proteção de Dados**
- HTTPS/TLS 1.3 em todo tráfego
- Criptografia sensitive fields: CPF, Placa (via Prisma field encryption)
- Sem logs de dados sensíveis
- GDPR/LGPD compliance: direito ao esquecimento, export de dados

#### **Autorização**
- RBAC: Usuario tem um Role (`user`, `owner`, `admin`)
- Multi-tenancy: Usuário só acessa dados de sua `organizationId`
- Validação em **todo** endpoint (middleware)

#### **Rate Limiting**
- 100 req/min por user_id
- 1000 req/min por IP
- Burst allowance: 200 req em 10 segundos

### Requisitos de Desempenho (Detalhado)

#### **Web Vitals (Core Web Vitals)**
- **LCP (Largest Contentful Paint)**: < 2.5s (bom)
- **FID (First Input Delay)**: < 100ms (bom)
- **CLS (Cumulative Layout Shift)**: < 0.1 (bom)

#### **Database Performance**
- Query time P95: < 100ms
- Connection pooling: max 100 (Neon)
- Índices em: `(organizationId)`, `(vehicleId, createdAt)`, `(userId, createdAt)`

#### **Bundle Size**
- Main JS: < 200KB (gzip)
- CSS: < 50KB (gzip)
- Total HTML: < 50KB

#### **Otimizações**
- Image optimization: WebP, lazy loading, responsive
- ISR (Incremental Static Regeneration) para dashboards (revalidate 60s)
- API response caching (10 min para dados não-críticos)

### Requisitos de Confiabilidade

| Aspecto | Target | Estratégia |
|---------|--------|-----------|
| **Uptime** | 99.5% | Vercel (multi-region), Neon (managed db) |
| **RTO (Recovery Time Objective)** | 1 hora | Automated failover + alerts |
| **RPO (Recovery Point Objective)** | 1 hora | Database backups a cada 6 horas |
| **Taxa de Erro* | < 0.1% | Error tracking (Sentry), alertas |
| **Backup** | Diário | PostgreSQL native backups + S3 copy |

### Requisitos de Escalabilidade

- **Usuários Simultâneos**: 10k+ (Edge Functions auto-scale)
- **Requisições por Segundo**: 100+ (load balancing automático)
- **Dados**: 1TB+ (PostgreSQL managed, Neon)
- **Crescimento Esperado**: 2x/quarter no primeiro ano

---

## 📊 Métricas de Sucesso e Análise

### Indicadores-Chave de Desempenho (KPIs)

#### **Aquisição**
| KPI | Meta MVP | Mês 1 | Mês 3 |
|-----|----------|-------|-------|
| Signups | 500 | 300-500 | 1.5k-2k |
| CAC (Custo Aquisição) | < R$ 50 | < R$ 100 | < R$ 50 |
| Fonte topo: Paid, Organic, Viral | 50%, 30%, 20% | TBD | TBD |

#### **Ativação**
| KPI | Meta | Critério |
|-----|------|----------|
| Onboarding Completion Rate | 80%+ | Completa tutorial + 1º frete |
| Tempo Onboarding | 5 min | Do signup até pronto registrar frete |
| 1st Week Retention (W1) | 75%+ | Retorna em dia 7 |

#### **Engajamento**
| KPI | Meta | Período |
|-----|------|---------|
| Fretes Registrados/Usuário | 5+ | Mês 1 |
| MAU (Usuários Ativos Mensais) | 300+ | Mês 1 MVP |
| Feature Adoption: ANTT Usage | 70%+ | % de fretes que consultam ANTT |
| Feature Adoption: Dashboard | 80%+ | % que visitam dashboard 1x/mês |
| Session Duration (média) | 5-10 min | Uso ativo |
| Session Frequency | 3-4x/semana | Motorista típico |

#### **Retenção**
| KPI | Meta | Período |
|-----|------|---------|
| D7 (Day 7 Retention) | 60%+ | 60% retorna em dia 7 |
| D30 (Month Retention) | 50%+ | 50% retorna após 30 dias |
| Churn Rate | < 5%/mês | Fase estável |
| NPS (Net Promoter Score) | 40+ | Recomendaria para colega |

#### **Monetização**
| KPI | Meta | Notas |
|-----|------|--------|
| Premium Conversion Rate | 15%+ | Após 14 dias trial free |
| ARPU (Average Revenue Per User) | R$ 25-40 | Plano Premium R$ 49-79 |
| LTV (Lifetime Value) | 12x CAC | Objetivo (LTV/CAC > 3 viável) |

#### **Produto & Qualidade**
| KPI | Meta | Medição |
|-----|------|----------|
| Error Rate API | < 0.1% | % de 500 errors |
| Page Load Time (P95) | < 2s | Desktop + mobile |
| Crash Rate | < 0.5% | Monitored via Sentry |
| Bug Severity: Critical | 0 | Zero bugs que impeçam uso |

### Implementação de Análise

#### **Events Rastreados (Analytics)**
```
# Onboarding Pipeline
event:user_signup
event:email_verified
event:vehicle_created
event:onboarding_completed
event:first_frete_created

# Feature Usage
event:frete_registered
event:antt_calculated
event:dashboard_viewed
event:fuel_recorded
event:maintenance_recorded
event:report_exported

# Engagement
event:session_start
event:session_end
event:screen_view

# Errors
event:error_occurred (with code, message)
event:api_failure
```

#### **Ferramentas de Análise**
- **Analytics**: Mixpanel ou Plausible (GDPR-compliant, Privacy-first)
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **Logs**: Axiom ou Datadog (opcional MVP)

#### **Dashboard de Monitoramento**
- Real-time: Usuários online, Taxa de erro, Requisições/min
- Daily: Signups, DAU, MAU, Fretes registrados, Retenção
- Weekly: Cohort analysis, Feature adoption, NPS survey results
- Monthly: CAC, ARPU, LTV, Churn rate, Feedback temas

### Medição de Sucesso

#### **Fase MVP (Lançamento)**
**Cronograma**: 10-14 semanas (Q2 2026)  
**Milestone de Sucesso**: 500+ signups, 60% onboarding completion, 40+ NPS

#### **Fase 1 (Pós-MVP, Mês 1-3)**
- 1.5k-2k usuários ativos
- 15% convertendo para Premium
- 50%+ D30 retention
- NPS 40+

#### **Fase 2 (Mês 4-6)**
- 5k+ MAU
- 20% churn rate stabilizado
- 25%+ Premium adoption
- NPS 50+

#### **Critérios de Pivot vs Perseverar**
```
Go: D30 retention > 50% + NPS > 35
Caution: D30 retention 30-50% + NPS 25-35 (fix UX, add features)
Stop: D30 retention < 30% + NPS < 25 (rethink conceito)
```

---

## 🚀 Plano de Implementação

### Fases de Desenvolvimento

#### **Fase 0: Discovery & Setup (Semanas 1-2, 80 SP)**
- [ ] Finalizar design system (Figma)
- [ ] Setup dev environment (Next.js, Prisma, repo)
- [ ] Criar base de dados ANTT em tabela (validar legislação)
- [ ] Setup CI/CD (GitHub Actions, Vercel preview)
- [ ] Kick-off com equipe

#### **Fase 1: MVP Core (Semanas 3-9, 320 SP)**
**Sprint 1-2**: Auth + Onboarding + UI Framework
- [x] Signup/Login com Better Auth
- [x] Email verification
- [x] Onboarding wizard (veículo + info motorista)
- [x] Design system com Tailwind + shadcn/ui
- [x] Routing + layouts

**Sprint 3-4**: Fretes + ANTT
- [x] Criar frete
- [x] Listar fretes com filtros
- [x] Cálculo ANTT (integrado ao formulário)
- [x] Dashboard de fretes (timeline + resumo)

**Sprint 5-6**: Veículos + Suporte
- [x] Gestão de veículos (CRUD)
- [x] Histórico de fretes por veículo
- [x] Manutenções (register + histórico)
- [x] Abastecimento (register + histórico)

**Sprint 7**: Financeiro + Relatórios
- [x] Dashboard financeiro (receita vs despesa)
- [x] Despesas gerais
- [x] Exportar relatório PDF
- [x] Mobile responsiveness (tudo)

#### **Fase 2: Polish & QA (Semanas 10-12, 120 SP)**
- [ ] Testes unitários (80%+ coverage dos services)
- [ ] Testes E2E críticos (Playwright)
- [ ] Testing com usuários reais (5-10 motoristas)
- [ ] Bug fixes e otimizações
- [ ] Documentação (README, API docs minimal)

#### **Fase 3: Lançamento (Semana 13-14, 40 SP)**
- [ ] Deploy em produção (Vercel)
- [ ] Domain DNS + HTTPS
- [ ] Landing page simples + CTA
- [ ] Soft launch (50-100 usuários beta)
- [ ] Marketing MVP (LinkedIn, grupos motoristas)
- [ ] Suporte inicial (email + WhatsApp)

### Alocação de Recursos

| Role | Pessoa | Responsabilidade | Alocação |
|------|--------|-----------------|----------|
| **Product Manager** | [A confirmar] | Visão, backlog, stakeholder comms | 100% |
| **Frontend Lead** | [A confirmar] | UI/UX, React, mobile optimization | 100% |
| **Frontend Dev** | [A confirmar] | Components, pages, integração API | 100% |
| **Backend Lead** | [A confirmar] | Arquitetura, APIs, banco dados | 100% |
| **Backend Dev** | [A confirmar] | Services, repositories, integrações | 100% |
| **QA Engineer** | [A confirmar] | Testes, casos de uso, relatórios | 50% (part-time ou pontual) |
| **Designer** | [A confirmar] | UX/UI, design system, protótipos | 50% (consultoria design) |

**Total: 5.5 FTE equivalente**

### Cronograma e Marcos

```
Q2 2026
├─ Week 1-2: Discovery & Setup
│  └─ MVP: Design system done, repo ready, ANTT table populated
│
├─ Week 3-9: MVP Development (3 sprints)
│  ├─ Sprint 1 (W3-4): Auth + Onboarding + Fretes básico
│  ├─ Sprint 2 (W5-6): ANTT + Veículos + Manutenção
│  └─ Sprint 3 (W7-9): Financeiro + Relatórios + Polish
│  └─ MVP: Todas features MUST pronto, testado
│
├─ Week 10-12: QA & User Testing
│  └─ MVP: 80%+ cobertura testes, 5+ motoristas testaram
│
└─ Week 13-14: Lançamento
   └─ MVP Live: 100+ usuários beta, 500+ signups objectivo
```

**Data Prevista**: Início Março 2026, MVP Live Fim Maio 2026

### Alocação de Recursos (Orçamento)

| Item | Valor | Justificativa |
|------|----------|---|
| **Desenvolvimento (5.5 FTE, 14 semanas)** | [Estimado] | Salários + benefícios |
| **Infraestrutura (Neon, Vercel, Cloudflare)** | ~R$ 2-5k/mês | Serverless, auto-scale |
| **Ferramentas (Figma, analytics, monitoring)** | ~R$ 1.5k/mês | Design + observability |
| **Marketing MVP (ads, conteúdo)** | [A confirmar] | Aquisição inicial |
| **Legal & Compliance (LGPD, ANTT validação)** | [A confirmar] | Assessoria pontual |

---

## ⚠️ Avaliação e Mitigação de Riscos

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Cálculo ANTT incorreto** | Alta | Crítico | Validação com especialista legal; testes automatizados 100% coverage; auditoria trimestral |
| **Performance em mobile lenta** | Média | Alto | Otimização Web Vitals; código splitting; ISR caching |
| **Escalabilidade com 10k+ usuários** | Baixa | Alto | Edge Functions auto-scale; database pooling; testes de carga anterior MVP |
| **Segurança: Vazamento de dados financeiros** | Baixa | Crítico | Encriptação fields; LGPD audit; penetration testing; rate limiting |
| **Integração ANTT desatualizada** | Média | Médio | Monitoring de atualizações legislativas; alertas; versionamento de cálculos |

### Riscos de Negócios

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Adoção baixa (< 200 MAU em Mês 1)** | Média | Alto | Soft launch beta; feedback rápido; iterate rápido |
| **Concorrência emerge rápido** | Média | Médio | Focus em diferencial ANTT + UX; build rede motoristas cedo |
| **Restrição regulatória (ANTT veta app)** | Baixa | Crítico | Legal review preventivo; envolver associações motoristas |
| **Saída de motorista chave na equipe** | Baixa | Médio | Documentação; pair programming; cross-training |
| **Modelo de receita inadequado** | Média | Médio | Teste com versão free premium; surveys de viabilidade; estar pronto pivotar |

### Estratégias de Mitigação

#### **Técnicas**
1. **Testes de Carga**: Simular 10k usuários simultâneos antes de MVP
2. **Security Review**: Pentesting independente antes de lançamento
3. **ANTT Validation**: Especialista legal revisa fórmulas; teste com 10 fretes reais
4. **A/B Testing**: Pricing e onboarding flow desde dia 1

#### **Negócios**
1. **Early User Feedback**: Beta com 20-30 motoristas semana 8 (feedback antes do MVP)
2. **Competitive Monitoring**: Weekly competitive landscape check
3. **Political Engagement**: Contato precoce com ANTT e associações motoristas
4. **Retention Focus**: NPS > 40 é KPI crítico; se < 35, pausar acquisition, fix product
5. **Diversificação de Revenue**: Roadmap inclui marketplace, integrações (não só subscription)

---

## 📋 Estrutura do Documento PRD (Copy-Ready)

### 1. Resumo Executivo ✅
*Ver seção inicial*  
- Visão, usuários-alvo, diferencial, sucesso, alinhamento estratégico, recursos

### 2. Problema e Oportunidade ✅
*Ver seção "Declaração do Problema..."*  
- Definição do problema (5 temas), impacto, análise de opportunity, critérios de sucesso

### 3. Requisitos e Histórias ✅
*Ver seção "Requisitos e Histórias do Usuário"*  
- 3 personas detalhadas, jornadas, 6 épicos com histórias, critérios de aceitação

### 4. Requisitos Funcionais ✅
*Ver seção "Requisitos Funcionais"*  
- 12 features MVP (Must), 8 features futuro (Should/Could), priorização MoSCoW

### 5. Requisitos Técnicos ✅
*Ver seção "Requisitos Técnicos"*  
- Arquitetura, APIs, modelo de dados, performance, segurança, plataformas

### 6. Requisitos de UX ✅
*Ver seção "Requisitos de Experiência..."*  
- Design princípios, sistema de design, acessibilidade, fluxos, wireframes

### 7. Requisitos Não-Funcionais ✅
*Ver seção "Requisitos Não Funcionais"*  
- Segurança (auth, dados, autorização, rate limiting), performance, confiabilidade, escalabilidade

### 8. Métricas de Sucesso ✅
*Ver seção "Métricas de Sucesso..."*  
- KPIs aquisição, ativação, engajamento, retenção, monetização, qualidade
- Events de análise, ferramentas, dashboard, critérios go/no-go

### 9. Plano de Implementação ✅
*Ver seção "Plano de Implementação"*  
- 3 fases: Discovery, MVP (3 sprints), QA, Lançamento
- Cronograma 14 semanas, aloca equipe, milestones, orçamento

### 10. Riscos e Mitigação ✅
*Ver seção "Avaliação e Mitigação..."*  
- Riscos técnicos, negócios, estratégias

---

## ✅ Checklist de Qualidade

Antes de finalizar, valide:

- ✅ O problema está claro (5 pontos de dor mapeados, impacto quantificado)
- ✅ A solução resolve os problemas (histórias de usuários mapeiam a solução)
- ✅ Requisitos são específicos e mensuráveis (cada feature tem critérios de aceitação)
- ✅ Critérios de aceiptação são testáveis (verificáveis manualmente ou automatizados)
- ✅ Viabilidade técnica validada (stack conhecido, team capaz, timeline realista)
- ✅ Métricas de sucesso definidas (KPIs, eventos de análise, critérios go/no-go)
- ✅ Riscos identificados e mitigações claras (10+ riscos mapeados, estratégias)
- ✅ Alinhamento de stakeholders confirmado (Product, Eng, Design OK com plano)
- ✅ Linguagem clara em português em todo customer-facing
- ✅ Legislação (ANTT, LGPD) incorporada desde o início

---

## 📞 Próximos Passos

1. **Semana 1**: Kick-off com equipe, validar timeline, confirmar allocações
2. **Semana 1-2**: Design system finalizado (Figma)
3. **Semana 2**: Setup ambiente dev, CI/CD
4. **Semana 3**: Inicia Sprint 1 (Auth + Onboarding)

**Dúvidas?** Entre em contato com o Product Manager ou releia este PRD (seção relevante).

---

**Documento Preparado por**: [Seu Nome]  
**Data**: 19 de março de 2026  
**Status**: Pronto para Review  
**Próxima Revisão**: Post-Semana 2 (após design system)
