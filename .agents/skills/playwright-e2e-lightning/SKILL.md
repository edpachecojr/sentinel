---
name: playwright-e2e-lightning
description: Executa testes funcionais end-to-end na aplicação Lightining usando o Playwright MCP Server. Capaz de abrir o navegador, criar um usuário, concluir o onboarding e cadastrar um paciente completo. Use quando o usuário pedir para "testar", "validar o fluxo", "abrir o navegador e cadastrar", "rodar o teste E2E" ou qualquer variação de teste funcional manual na aplicação.
---

# Playwright E2E — Lightning

Skill independente para testes funcionais end-to-end da aplicação Lightning via Playwright MCP Server.

## Pré-requisitos

1. **Dev server rodando**: `pnpm dev` em `http://localhost:3000`
2. **Playwright MCP instalado**: use `mcp_microsoft_pla_browser_install` se necessário
3. **Banco de dados disponível**: o `DATABASE_URL` no `.env.local` deve estar acessível

Se o servidor não estiver no ar, instrua o usuário a rodar `pnpm dev` antes de continuar.

---

## Dados de Teste Padrão

Use estes dados (ou gere variações únicas com timestamp para evitar conflito de e-mail/CPF).

```
nome:         Automatizado E2E
email:        e2e+<timestamp>@lightning.dev   (ex: e2e+1742000000@lightning.dev)
senha:        Senha@12345
displayName:  Dra. Ana Lima
orgName:      Clínica E2E

paciente:
  nome:           Carla Beatriz Ferreira
  email:          carla+<timestamp>@exemplo.dev
  telefone:       (11) 98765-4321
  cpf:            529.982.247-25          (CPF válido para testes)
  dataNascimento: 15/06/1990
  genero:         FEMININO
  fonte:          OUTRO
  cep:            01310-100               (Av. Paulista, SP — use ViaCEP)
  numeroEndereco: 1578
  complemento:    Sala 42
```

> **Evite o sufixo "Teste" em nomes de pacientes.** Use nomes plausíveis e realistas (ex: "Carla Beatriz Ferreira", "João Mendes Silva") para validar que o sistema lida bem com nomes comuns. Gere e-mails únicos com timestamp para evitar conflitos.

---

## Fluxo Completo

Execute **em sequência**. Após cada etapa tire um screenshot para confirmar o estado.

### Etapa 1 — Abrir navegador e navegar para /register

```
mcp_microsoft_pla_browser_navigate  →  url: "http://localhost:3000/register"
mcp_microsoft_pla_browser_snapshot  →  verificar que a página de cadastro carregou
```

Espere pelo seletor `#register-name` antes de prosseguir.

### Etapa 2 — Criar conta (RegisterForm)

Campos disponíveis e seus IDs:

| Campo             | ID/Seletor                     | Obrigatório |
|-------------------|-------------------------------|-------------|
| Nome completo     | `#register-name`              | ✅           |
| E-mail            | `#register-email`             | ✅           |
| Senha             | `#register-password`          | ✅ (mín. 8) |
| Confirmar senha   | `#register-confirm-password`  | ✅           |

```
mcp_microsoft_pla_browser_type  →  selector: "#register-name",       text: "Teste Automatizado"
mcp_microsoft_pla_browser_type  →  selector: "#register-email",      text: "teste+<timestamp>@neoagenda.dev"
mcp_microsoft_pla_browser_type  →  selector: "#register-password",   text: "Senha@12345"
mcp_microsoft_pla_browser_type  →  selector: "#register-confirm-password",  text: "Senha@12345"
mcp_microsoft_pla_browser_click →  selector: "button[type='submit']"
```

**Verificação**: aguardar redirect para `/onboarding`. Use `mcp_microsoft_pla_browser_wait_for` com `url` contendo `/onboarding`.

> **Salvar credenciais**: após criar a conta com sucesso, salve e-mail e senha no arquivo temporário de sessão (ver seção **Sessão de Credenciais** abaixo) para reutilizar nos testes de logout/login.

### Etapa 3 — Onboarding (2 passos)

O onboarding tem 2 etapas obrigatórias.

**Passo 1 — Nome de exibição** (campo `#onboarding-display-name`):
```
mcp_microsoft_pla_browser_wait_for →  selector: "#onboarding-display-name"
mcp_microsoft_pla_browser_triple_click → selector: "#onboarding-display-name"   (seleciona tudo)
mcp_microsoft_pla_browser_type    →  selector: "#onboarding-display-name",  text: "Dr. Teste"
mcp_microsoft_pla_browser_click   →  selector: "button[type='submit']"         (botão "Próximo")
```

**Passo 2 — Nome da organização** (campo `#onboarding-org-name`):
```
mcp_microsoft_pla_browser_wait_for →  selector: "#onboarding-org-name"
mcp_microsoft_pla_browser_type    →  selector: "#onboarding-org-name",  text: "Clínica Teste E2E"
mcp_microsoft_pla_browser_click   →  selector: "button[type='submit']"         (botão "Concluir")
```

**Verificação**: aguardar redirect para `/dashboard`.

### Etapa 4 — Navegar para cadastro de paciente

```
mcp_microsoft_pla_browser_navigate →  url: "http://localhost:3000/pacientes/novo"
mcp_microsoft_pla_browser_wait_for →  selector: "#name"
mcp_microsoft_pla_browser_snapshot →  confirmar que o formulário carregou
```

### Etapa 5 — Preencher formulário de paciente (PatientForm)

#### 5a. Informações pessoais

| Campo              | ID/Seletor       | Tipo          | Notas                               |
|--------------------|-----------------|---------------|-------------------------------------|
| Nome *             | `#name`         | text          | Obrigatório                         |
| E-mail             | `#email`        | email         |                                     |
| Sexo *             | `#gender`       | select custom | Valores: `MASCULINO` / `FEMININO`   |
| Telefone           | `#phone`        | masked        | Formato: `(11) 98765-4321`          |
| CPF                | `#cpf`          | masked        | Formato: `529.982.247-25`           |
| Data Nascimento    | `#birthDate`    | masked        | Formato: `DD/MM/AAAA`               |
| Fonte              | *(select)*      | select custom | Padrão: `OUTRO`                     |
| Nome do Responsável| `#responsibleName` | text       | Opcional                            |

```
mcp_microsoft_pla_browser_type   →  selector: "#name",      text: "Maria Silva Teste"
mcp_microsoft_pla_browser_type   →  selector: "#email",     text: "maria+<timestamp>@paciente.dev"
mcp_microsoft_pla_browser_type   →  selector: "#phone",     text: "11987654321"
mcp_microsoft_pla_browser_type   →  selector: "#cpf",       text: "52998224725"
mcp_microsoft_pla_browser_type   →  selector: "#birthDate", text: "15061990"
```

**Sexo (select customizado)**: Os selects do projeto são componentes customizados. Use snapshot para localizar o trigger e clique na opção desejada:
```
mcp_microsoft_pla_browser_snapshot  →  inspecionar o seletor de Sexo
mcp_microsoft_pla_browser_click     →  selector: "#gender"     (ou trigger visível no snapshot)
mcp_microsoft_pla_browser_click     →  selector: "text=Feminino"
```

Se `select_option` funcionar com o elemento nativo subjacente, prefira:
```
mcp_microsoft_pla_browser_select_option →  selector: "#gender",  value: "FEMININO"
```

#### 5b. Endereço (preenchimento via ViaCEP)

O campo CEP (`#zipCode`) dispara autopreenchimento de logradouro, bairro, cidade e estado via ViaCEP ao sair do campo (blur).

```
mcp_microsoft_pla_browser_type   →  selector: "#zipCode",         text: "01310100"
mcp_microsoft_pla_browser_press_key → key: "Tab"                  (dispara o blur/ViaCEP)
mcp_microsoft_pla_browser_wait_for  →  selector: "#addressNumber" (aguardar campos preenchidos)
mcp_microsoft_pla_browser_type   →  selector: "#addressNumber",   text: "1578"
mcp_microsoft_pla_browser_type   →  selector: "#addressComplement", text: "Sala 42"
```

Após o ViaCEP, logradouro, bairro, cidade e estado são preenchidos automaticamente.

#### 5c. Submeter o formulário

```
mcp_microsoft_pla_browser_click  →  selector: "button[type='submit']"
mcp_microsoft_pla_browser_wait_for →  url contendo "/pacientes"    (redirect pós-criação)
mcp_microsoft_pla_browser_screenshot → confirmar tela de lista de pacientes com toast de sucesso
```

---

## Sessão de Credenciais (Arquivo Temporário)

Para viabilizar testes de logout e re-login sem repetir o cadastro, salve as credenciais do usuário criado em memória de sessão **antes** de continuar.

Use a ferramenta `memory` (comando `create`) para registrar o arquivo:

```
Caminho: /memories/session/e2e-credentials.md

Conteúdo sugerido:
# Credenciais E2E — Sessão Atual

email:        e2e+1742000000@neoagenda.dev
senha:        Senha@12345
displayName:  Dra. Ana Lima
orgName:      Clínica E2E
criadoEm:     2026-03-18T10:00:00
```

> Se o arquivo já existir, use `str_replace` para atualizar os valores.

### Etapa de Logout / Re-login (reutilização de credenciais)

Quando precisar testar logout e re-login, leia `/memories/session/e2e-credentials.md` e use os dados salvos:

```
1. mcp_microsoft_pla_browser_navigate   → url: "http://localhost:3000/api/auth/sign-out" (ou acione via UI)
   -- alternativa via UI --
   mcp_microsoft_pla_browser_snapshot   → localizar botão de logout no dropdown do usuário
   mcp_microsoft_pla_browser_click      → seletor do botão de logout
   mcp_microsoft_pla_browser_wait_for   → url contendo "/login"

2. mcp_microsoft_pla_browser_navigate   → url: "http://localhost:3000/login"
   mcp_microsoft_pla_browser_type       → selector: "#email",    text: <email salvo>
   mcp_microsoft_pla_browser_type       → selector: "#password", text: <senha salva>
   mcp_microsoft_pla_browser_click      → selector: "button[type='submit']"
   mcp_microsoft_pla_browser_wait_for   → url contendo "/dashboard"
   mcp_microsoft_pla_browser_snapshot   → confirmar dashboard carregado
```

---

## Etapa 6 — Cadastrar Agendamento (via Dashboard ou Calendário)

O agendamento pode ser criado pelo botão **"Novo Agendamento"** no dashboard ou clicando em um slot no calendário em `/agenda/calendario`. Ambos abrem o mesmo modal (`EventModal`).

### 6a. Via Dashboard

```
mcp_microsoft_pla_browser_navigate  → url: "http://localhost:3000/dashboard"
mcp_microsoft_pla_browser_snapshot  → localizar o botão "Novo Agendamento"
mcp_microsoft_pla_browser_click     → selector: "text=Novo Agendamento"
mcp_microsoft_pla_browser_wait_for  → selector: "#patient"    (modal abriu)
```

### 6b. Via Calendário

```
mcp_microsoft_pla_browser_navigate  → url: "http://localhost:3000/agenda/calendario"
mcp_microsoft_pla_browser_snapshot  → confirmar que o calendário carregou
mcp_microsoft_pla_browser_click     → clicar em um slot de horário vazio (ex: slot das 09:00 do dia)
mcp_microsoft_pla_browser_wait_for  → selector: "#patient"    (modal abriu)
```

### 6c. Preencher o modal de agendamento

| Campo            | ID/Seletor               | Tipo          | Valores possíveis / Notas                                     |
|------------------|--------------------------|---------------|---------------------------------------------------------------|
| Paciente *       | `#patient`               | select nativo | Selecionar pelo nome cadastrado na Etapa 5                    |
| Data *           | `#startDate`             | DatePicker    | Formato: `DD/MM/AAAA` — use o componente flat                 |
| Hora *           | `#startTime`             | `time`        | Formato: `HH:mm` (ex: `09:00`)                               |
| Duração          | `#duration`              | select nativo | `15`, `30`, `45`, `50`, `60`, `90`, `120` (minutos)          |
| Modalidade       | `#modality`              | select nativo | `PRESENCIAL` / `TELEATENDIMENTO` / `DOMICILIAR`              |
| Recorrência      | `#recurrence`            | select nativo | `NENHUMA` / `SEMANAL` / `QUINZENAL` / `MENSAL`              |
| Data fim recorr. | `#dataFimRecorrencia`    | `date`        | Aparece apenas se recorrência ≠ NENHUMA. Formato: `YYYY-MM-DD` |
| Tipo pagador     | `#tipo`                  | select nativo | `PARTICULAR` / `CONVENIADO` / `HOME_CARE`                   |
| Observações      | `#notas`                 | textarea      | Texto livre                                                  |

```
mcp_microsoft_pla_browser_select_option → selector: "#patient",   value: <id-do-paciente>
  -- se o ID não estiver acessível, use texto visível --
mcp_microsoft_pla_browser_snapshot      → localizar o select de paciente e a opção correta

-- Data (DatePicker customizado — interagir via input interno ou clique no calendário):
mcp_microsoft_pla_browser_snapshot      → localizar o input de data dentro do DatePicker (#startDate)
mcp_microsoft_pla_browser_click         → selector: "#startDate input" (abre o calendário flat)
mcp_microsoft_pla_browser_click         → clicar no dia desejado no calendário

-- Horário:
mcp_microsoft_pla_browser_fill_form     → selector: "#startTime",  value: "09:00"

-- Duração:
mcp_microsoft_pla_browser_select_option → selector: "#duration",   value: "50"

-- Modalidade:
mcp_microsoft_pla_browser_select_option → selector: "#modality",   value: "PRESENCIAL"

-- Tipo de pagador:
mcp_microsoft_pla_browser_select_option → selector: "#tipo",       value: "PARTICULAR"

-- Observações (opcional):
mcp_microsoft_pla_browser_type          → selector: "#notas",      text: "Sessão de avaliação inicial"

-- Salvar:
mcp_microsoft_pla_browser_click         → selector: "text=Salvar"   (ou "Criar Agendamento")
mcp_microsoft_pla_browser_snapshot      → confirmar que o modal fechou e o evento aparece no calendário / toast de sucesso
```

**Verificação pós-criação**: O evento deve aparecer no calendário. Use `snapshot` para confirmar. Erros são exibidos como toast.

### Erros comuns — Agendamento

| Sintoma                                    | Causa provável                          | Ação                                        |
|--------------------------------------------|-----------------------------------------|---------------------------------------------|
| Select de paciente vazio                   | Nenhum paciente cadastrado              | Cadastrar paciente primeiro (Etapa 5)       |
| Botão "Salvar" desabilitado                | Paciente não selecionado                | Selecionar paciente no `#patient`           |
| Modal fecha mas evento não aparece         | Slot já ocupado / conflito              | Escolher outro horário                      |
| DatePicker não responde a `type`           | Componente customizado (Flatpickr)      | Usar `click` no calendário interno          |

---

## Etapa 7 — Registrar Atendimento (Prontuário do Paciente)

O atendimento (`RegistrarAtendimentoForm`) é acessado pelo prontuário do paciente. O caminho é `/pacientes/:id/prontuario`. Pressupõe que o paciente foi cadastrado na Etapa 5.

> O formulário de registro de atendimento possui um **modal de confirmação** antes de salvar.

### 7a. Navegar para o prontuário

```
mcp_microsoft_pla_browser_navigate  → url: "http://localhost:3000/pacientes"
mcp_microsoft_pla_browser_snapshot  → localizar o link do paciente "Carla Beatriz Ferreira"
mcp_microsoft_pla_browser_click     → clicar no paciente na lista
mcp_microsoft_pla_browser_snapshot  → confirmar página de detalhe do paciente
mcp_microsoft_pla_browser_click     → selector: "text=Prontuário"  (ou link/aba para o prontuário)
mcp_microsoft_pla_browser_wait_for  → url contendo "/prontuario"
```

Alternativa direta (se o ID do paciente for conhecido):
```
mcp_microsoft_pla_browser_navigate  → url: "http://localhost:3000/pacientes/<id>/prontuario"
```

### 7b. Abrir o formulário de registro de atendimento

```
mcp_microsoft_pla_browser_snapshot  → localizar botão "Registrar Atendimento" ou "Novo Atendimento"
mcp_microsoft_pla_browser_click     → selector: "text=Registrar Atendimento"
mcp_microsoft_pla_browser_wait_for  → selector: "#horarioInicio"
```

### 7c. Preencher o formulário

| Campo              | ID/Seletor       | Tipo          | Notas                                              |
|--------------------|-----------------|---------------|----------------------------------------------------|
| Data               | `#data`          | DatePicker    | Data do atendimento                                |
| Horário de início  | `#horarioInicio` | MaskedInput   | Formato: `HH:mm` (ex: `09:00`)                    |
| Horário de fim     | `#horarioFim`    | MaskedInput   | Formato: `HH:mm` (ex: `10:00`)                    |
| Conduta terapêutica| `#conduta`       | textarea      | Obrigatório — mín. 1 char, máx. 3000              |
| Observações        | `#observacoes`   | textarea      | Opcional — máx. 2000 chars                        |

**Campos clínicos (checkboxes)**: Nível de consciência, orientação, respiração, alimentação, consistência, líquidos e escala FOIS são opcionais. Localize via `snapshot` e clique nos checkboxes desejados se necessário.

```
-- Data (DatePicker — interagir pelo componente flat):
mcp_microsoft_pla_browser_snapshot      → localizar input de data (#data)
mcp_microsoft_pla_browser_click         → seletor de abertura do DatePicker
mcp_microsoft_pla_browser_click         → clicar no dia atual no calendário

-- Horários (MaskedInput — digitar diretamente):
mcp_microsoft_pla_browser_type         → selector: "#horarioInicio",  text: "0900"
mcp_microsoft_pla_browser_type         → selector: "#horarioFim",     text: "1000"

-- Conduta (obrigatório):
mcp_microsoft_pla_browser_type         → selector: "#conduta",
                                          text: "Avaliação fonoaudiológica inicial. Orientações de postura e deglutição."

-- Observações (opcional):
mcp_microsoft_pla_browser_type         → selector: "#observacoes",
                                          text: "Paciente colaborativa. Retorno em 7 dias."

-- Submeter (abre modal de confirmação):
mcp_microsoft_pla_browser_click        → selector: "text=Registrar atendimento"
mcp_microsoft_pla_browser_wait_for     → selector: "text=Confirmar registro"  (modal de confirmação)
mcp_microsoft_pla_browser_snapshot     → confirmar resumo no modal
```

### 7d. Confirmar o registro

```
mcp_microsoft_pla_browser_click        → selector: "text=Confirmar registro"
mcp_microsoft_pla_browser_wait_for     → url contendo "/atendimentos"   (redirect pós-registro)
mcp_microsoft_pla_browser_snapshot     → confirmar toast "Atendimento registrado"
```

**Verificação**: Toast de sucesso "Atendimento registrado" deve aparecer e o redirect deve acontecer para `/atendimentos/:id` ou `/atendimentos`.

### Erros comuns — Atendimento

| Sintoma                                    | Causa provável                          | Ação                                               |
|--------------------------------------------|-----------------------------------------|----------------------------------------------------|
| Campo conduta com erro                     | Campo vazio ou muito curto              | Preencher com texto descritivo antes de submeter   |
| Horário de fim inválido                    | Formato incorreto ou fim < início       | Garantir `HH:mm` e que fim > início                |
| Modal de confirmação não abre              | Validação falhou                        | Checar `fieldErrors` via snapshot                  |
| Redirect não acontece após confirmar       | Erro de servidor                        | Capturar console errors via `console_messages`     |

---



### Após cada etapa crítica
- `mcp_microsoft_pla_browser_snapshot` para confirmar estado visual
- `mcp_microsoft_pla_browser_console_messages` para capturar erros JS

### Erros comuns

| Sintoma                                     | Causa provável                          | Ação                                      |
|---------------------------------------------|-----------------------------------------|-------------------------------------------|
| Campo não encontrado                        | Formulário não carregou                 | `wait_for` antes de interagir             |
| Redirect não acontece após register         | E-mail já existe no banco               | Use timestamp no e-mail                   |
| ViaCEP não preenche                         | CEP inválido ou servidor offline        | Insira endereço manualmente               |
| Onboarding volta ao passo 1                 | displayName < 2 chars                  | Limpe o campo antes de digitar            |
| Select de Sexo não seleciona                | Componente customizado                  | Use snapshot + click na opção de texto    |
| Tela em branco após login                   | Onboarding não concluído               | Verifique se o redirect foi para /onboarding |
| Erro 401 / "Não autorizado" no paciente     | Sessão expirou ou org não criada        | Repita o fluxo do zero                    |

### Limpeza entre testes
Para rodar múltiplas vezes sem conflito de dados, gere e-mails únicos com timestamp:
```js
const ts = Date.now();
const email = `teste+${ts}@neoagenda.dev`;
```

---

## Rotas Chave

| Rota                              | Descrição                              |
|-----------------------------------|----------------------------------------|
| `/register`                       | Criar nova conta                       |
| `/onboarding`                     | Configurar nome e organização          |
| `/dashboard`                      | Painel principal (pós-onboarding)      |
| `/agenda/calendario`              | Calendário de agendamentos             |
| `/pacientes`                      | Lista de pacientes                     |
| `/pacientes/novo`                 | Formulário de novo paciente            |
| `/pacientes/:id`                  | Detalhe/edição de paciente             |
| `/pacientes/:id/prontuario`       | Prontuário + formulário de atendimento |
| `/atendimentos`                   | Lista de atendimentos registrados      |
| `/atendimentos/:id`               | Detalhe do atendimento registrado      |

---

## Estratégia de Seletores

Prefira neste ordem:
1. **ID explícito** (`#name`, `#email`) — mais estável
2. **`aria-label` ou `role`** — acessível e semântico
3. **Texto visível** (`text=Criar conta`) — quando não há ID
4. **CSS class** — último recurso, frágil a redesigns

Use `mcp_microsoft_pla_browser_snapshot` sempre que um seletor falhar para localizar o elemento correto na árvore acessível atual.
