# Auth Structure — Next.js + better-auth + Prisma

Estrutura em camadas com responsabilidade única por arquivo.

## Diagrama de camadas

```
┌─────────────────────────────────────────────────────────┐
│                        UI Layer                         │
│                                                         │
│  Server Component (page.tsx)   Client Component (.tsx)  │
│  └─ chama requireAuthOrRedirect └─ usa useSession hook  │
│           │                             │               │
└───────────┼─────────────────────────────┼───────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Action Layer                        │
│              src/actions/authAction.ts                 │
│  - requireAuthOrRedirect()  → redireciona se inválido   │
│  - getSessionAction()       → retorna dados ao cliente  │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│             src/services/SessionService.ts             │
│  - getValidSession()  → busca + valida (ativo no DB)    │
│  - getRawSession()    → sessão bruta sem validação      │
│  - UnauthenticatedError / InactiveUserError (tipados)   │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                      Lib Layer                          │
│                  (infraServices)                        │
│                                                         │
│  Auth.ts        → instância do better-auth          │
│  Prisma.ts      → singleton do PrismaClient         │
│  AuthClient.ts → cliente React do better-auth      │
└─────────────────────────────────────────────────────────┘
```

## Estrutura de arquivos

```
src/
├── libs/
│   ├── Auth.ts           ← better-auth server instance
│   ├── AuthClient.ts    ← better-auth client (React hooks)
│   └── Prisma.ts         ← Prisma singleton
│
├── services/
│   └── SessionService.ts    ← lógica: buscar + validar sessão
│
├── actions/
│   └── authAction.ts        ← Server Actions chamadas pela UI
│
├── components/
│   └── UserProfileCard.tsx ← exemplo: Client Component
│
└── app/
    └── dashboard/
        └── page.tsx          ← exemplo: Server Component protegido
```

## Regras de dependência

| Camada    | Pode importar       | Nunca importa          |
|-----------|---------------------|------------------------|
| Lib       | nada interno        | services, actions, UI  |
| Service   | libs                | actions, UI            |
| Action    | services, libs      | UI diretamente         |
| Component | actions, auth-client| services diretamente   |

## Fluxo em Server Component

```
page.tsx
  └─► requireAuthOrRedirect()        [action]
        └─► getValidSession()        [service]
              ├─► auth.api.getSession()   [lib → better-auth]
              └─► prisma.user.findUnique  [lib → Prisma]
                    ├─ ok  → retorna { session, user }
                    └─ erro → redirect("/login")
```

## Fluxo em Client Component

```
UserProfileCard
  ├─► useSession()              [lib → better-auth React hook]
  │     └─ dados reativos locais (sem verificar isActive)
  │
  └─► getSessionAction()        [action via Server Action]
        └─► getValidSession()   [service — roda no servidor]
              └─ erro → router.replace("/login")
```