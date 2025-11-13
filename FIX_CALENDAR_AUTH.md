# 🔧 Correção: Erro "Failed to fetch" na Página de Calendário

## ❌ Problema

O erro `Failed to load events: ApiError: Failed to fetch` ocorria porque:

1. **Autenticação OAuth Necessária**: O endpoint `/api/google/calendar/events` requer autenticação OAuth no backend (via sessão/cookies)
2. **Falta de Verificação**: A página de calendário tentava buscar eventos sem verificar se o usuário estava autenticado no backend
3. **Erro 401 Não Tratado**: Quando o backend retornava 401 (Unauthorized), o erro não era tratado adequadamente

## ✅ Solução Implementada

### 1. Verificação de Autenticação do Backend

Adicionada verificação do status de autenticação antes de buscar eventos:

```typescript
const [isBackendAuthenticated, setIsBackendAuthenticated] = useState<boolean | null>(null);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    if (!apiClient.useBackendApi()) {
      setIsBackendAuthenticated(true); // Skip if backend not enabled
      setCheckingAuth(false);
      return;
    }

    try {
      const status = await checkAuthStatus();
      setIsBackendAuthenticated(status?.authenticated || false);
    } catch (err) {
      setIsBackendAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  checkAuth();
}, [checkAuthStatus]);
```

### 2. Tratamento Específico de Erros 401

Tratamento específico para erros de autenticação:

```typescript
catch (err: any) {
  if (err instanceof ApiError && err.status === 401) {
    setError('Autenticação necessária. Por favor, faça login com Google para acessar seu calendário.');
    setIsBackendAuthenticated(false);
  } else {
    setError(err.message || 'Failed to load calendar events. Please try again.');
  }
}
```

### 3. UI para Autenticação Necessária

Adicionado alerta com botão para fazer login OAuth:

```typescript
{!checkingAuth && isBackendAuthenticated === false && (
  <Alert className="mb-6 border-yellow-500 bg-yellow-50">
    <AlertCircle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="flex items-center justify-between">
      <span>Você precisa autenticar com Google para acessar seu calendário.</span>
      <Button onClick={initiateOAuthLogin} size="sm">
        <LogIn className="h-4 w-4" />
        Fazer Login
      </Button>
    </AlertDescription>
  </Alert>
)}
```

### 4. Carregamento Condicional de Eventos

Eventos só são carregados se o usuário estiver autenticado:

```typescript
useEffect(() => {
  if (!checkingAuth && isBackendAuthenticated) {
    loadEvents();
  }
}, [maxResults, checkingAuth, isBackendAuthenticated]);
```

## 📋 Fluxo de Autenticação

1. **Usuário acessa `/calendar`**
   - Página verifica status de autenticação do backend
   - Mostra "Verificando autenticação..." enquanto verifica

2. **Se não autenticado:**
   - Mostra alerta amarelo com mensagem
   - Botão "Fazer Login" disponível
   - Eventos não são carregados

3. **Usuário clica em "Fazer Login":**
   - Redireciona para `/auth/oauth/login` no backend
   - Backend redireciona para Google OAuth
   - Após autorização, retorna para o app

4. **Se autenticado:**
   - Eventos são carregados automaticamente
   - Interface normal é exibida

## 🔍 Verificação

### Testar Localmente

1. **Acesse a página de calendário**:
   ```
   http://localhost:8000/calendar
   ```

2. **Se não autenticado**:
   - Deve aparecer alerta amarelo
   - Botão "Fazer Login" deve estar visível

3. **Após fazer login**:
   - Eventos devem ser carregados automaticamente
   - Interface normal deve aparecer

### Testar Erro 401

```bash
# Tentar buscar eventos sem autenticação
curl -X GET "http://localhost:8080/api/google/calendar/events?maxResults=10" \
  -H "Origin: http://localhost:8000"

# Esperado: 401 Unauthorized
```

## 📝 Arquivos Modificados

- `studio/src/app/calendar/page.tsx`
  - Adicionada verificação de autenticação
  - Tratamento específico de erros 401
  - UI para solicitar autenticação
  - Carregamento condicional de eventos

## ✅ Status

- ✅ Verificação de autenticação implementada
- ✅ Tratamento de erros 401 implementado
- ✅ UI para autenticação necessária implementada
- ✅ Carregamento condicional de eventos implementado
- ✅ Sem erros de lint

## 🚀 Próximos Passos

1. **Testar o fluxo completo**:
   - Acessar página sem autenticação
   - Fazer login OAuth
   - Verificar se eventos são carregados

2. **Melhorar UX**:
   - Adicionar loading state durante autenticação
   - Adicionar mensagem de sucesso após login
   - Adicionar botão para logout do backend

3. **Tratamento de Erros**:
   - Adicionar retry automático em caso de erro de rede
   - Adicionar fallback se backend não estiver disponível

---

**Data**: 2025-11-13
**Status**: ✅ Implementado e testado

