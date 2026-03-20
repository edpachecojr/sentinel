# Corrigir Fluxo de Logout

**Branch:** `fix/corrigir-fluxo-logout`
**Description:** Mover `redirect('/login')` para fora do bloco `try/catch` em `sairAction` para que o Next.js possa processar o redirecionamento corretamente.

## Goal

O logout encerra a sessão com sucesso, mas o redirecionamento nunca acontece porque `redirect()` lança internamente um erro especial (`NEXT_REDIRECT`) que é capturado pelo `catch` do usuário antes que o runtime do Next.js possa interceptá-lo. A correção garante que o `redirect()` seja sempre processado após uma saída bem-sucedida.

## Root Cause

`redirect()` de `next/navigation` funciona lançando um erro com digest `NEXT_REDIRECT`. O Next.js captura esse erro no nível de runtime do server action e converte em uma instrução de navegação enviada ao cliente. Se o `catch` do usuário o capturar primeiro, o framework nunca vê o erro e a navegação não ocorre.

**Fluxo atual (quebrado):**
1. `sairHandler.executar()` → `auth.api.signOut()` → sessão destruída ✅
2. `redirect('/login')` → lança `NEXT_REDIRECT`
3. `catch (error)` captura o erro ❌
4. Retorna `{ success: false, error: 'NEXT_REDIRECT' }` — nunca navega

## Implementation Steps

### Step 1: Corrigir `sairAction` — mover `redirect()` para fora do `try/catch`

**Files:**
- `src/app/_actions/auth/sair.ts`

**What:**
Mover o `redirect('/login')` para fora do bloco `try/catch`. O `try/catch` deve capturar apenas erros reais do `sairHandler.executar()`. Se a saída for bem-sucedida (sem erro lançado), o `redirect('/login')` é chamado fora do bloco e o Next.js o processa normalmente, enviando a instrução de navegação ao cliente.

```typescript
// ANTES (quebrado)
export async function sairAction(): Promise<EstadoSair> {
  try {
    await container.sairHandler.executar();
    redirect('/login');          // ← NEXT_REDIRECT capturado pelo catch abaixo
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sair';
    return { success: false, error: message };
  }
}

// DEPOIS (corrigido)
export async function sairAction(): Promise<EstadoSair> {
  try {
    await container.sairHandler.executar();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao encerrar sessão';
    return { success: false, error: message };
  }
  redirect('/login');            // ← fora do catch; Next.js intercepta e navega
}
```

**Testing:**
1. Clicar em "Sair" no `UserDropdown`
2. Verificar que o browser navega automaticamente para `/login` sem necessidade de refresh manual
3. Verificar que tentar acessar rotas protegidas após o logout redireciona para `/login`
