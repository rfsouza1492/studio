# 🔍 Debug Checklist - OAuth Authentication Issue

**Problema:** Usuário já fez login OAuth, mas a tela ainda mostra "Fazer Login"  
**Data:** 2025-11-20

---

## ✅ Checklist Rápido (1 minuto)

### 1️⃣ Verificar Console do Navegador

**Ação:** Abra DevTools → Console

**O que procurar:**
- [ ] Mensagem "Login realizado com sucesso" aparece?
- [ ] Erros 401 aparecem no console?
- [ ] Erros de rede (Failed to fetch)?
- [ ] Logs de debug: `Events loaded after OAuth: X events`

**Se aparecer "Login realizado com sucesso":**
- ✅ OAuth foi concluído
- ⚠️ Problema está na verificação de status

**Se NÃO aparecer:**
- ❌ OAuth não foi concluído corretamente
- ⚠️ Verificar redirect URI e callback

---

### 2️⃣ Verificar Network Tab

**Ação:** DevTools → Network → Filtrar por "status" ou "oauth"

**Endpoints para verificar:**

#### A) `GET /auth/oauth/status`
```
URL: https://goflow--magnetai-4h4a8.us-east4.hosted.app/auth/oauth/status
Method: GET
Headers: Cookie: connect.sid=...
Credentials: include (important!)
```

**Resposta esperada (200 OK):**
```json
{
  "authenticated": true,
  "user": {
    "id": "123456789",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

**Como verificar no console:**
```javascript
// Cole este código no console do navegador
fetch('https://goflow--magnetai-4h4a8.us-east4.hosted.app/auth/oauth/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('OAuth Status:', data))
  .catch(err => console.error('Error:', err));
```

**OU use o script completo:**
```javascript
// Cole o conteúdo de DEBUG_OAUTH_SCRIPT.js no console
```

**Se retornar `authenticated: false`:**
- ❌ Token não está na sessão
- ⚠️ Verificar se cookie está sendo enviado
- ⚠️ Verificar se sessão expirou

#### B) `GET /api/google/calendar/events`
```
URL: https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/google/calendar/events?maxResults=10&timeMin=...
Method: GET
Headers: Cookie: connect.sid=...
```

**Se retornar 401:**
- ❌ Token OAuth não está válido
- ⚠️ Verificar escopos do token
- ⚠️ Verificar se token expirou

**Se retornar 200:**
- ✅ Tudo funcionando!
- ⚠️ Problema está no frontend (estado não atualizado)

---

### 3️⃣ Verificar Storage (Cookies/Session)

**Ação:** DevTools → Application → Storage → Cookies

**O que procurar:**

#### Cookie de Sessão
```
Name: connect.sid
Domain: .goflow--magnetai-4h4a8.us-east4.hosted.app
Value: s:xxxxx (deve existir)
Expires: (deve estar no futuro)
HttpOnly: true
Secure: true (em produção)
SameSite: Lax
```

**Se cookie NÃO existe:**
- ❌ Sessão não foi criada
- ⚠️ Verificar se backend está salvando sessão
- ⚠️ Verificar CORS/cookie settings

**Se cookie existe mas expirou:**
- ❌ Sessão expirou
- ⚠️ Fazer login novamente

---

### 4️⃣ Verificar Estado do Componente React

**Ação:** DevTools → React DevTools → Selecionar CalendarPage

**Estados para verificar:**

```typescript
isBackendAuthenticated: boolean | null
// Esperado: true (se autenticado)
// Atual: ?

checkingAuth: boolean
// Esperado: false (após verificação)
// Atual: ?

isLoading: boolean
// Esperado: false (após carregar eventos)
// Atual: ?

error: string | null
// Esperado: null (sem erros)
// Atual: ?
```

**Se `isBackendAuthenticated === false`:**
- ❌ Frontend não detectou autenticação
- ⚠️ Verificar chamada a `getOAuthStatus()`
- ⚠️ Verificar resposta do endpoint

**Se `isBackendAuthenticated === null`:**
- ⚠️ Verificação ainda em andamento
- ⚠️ Verificar se `checkingAuth === true`

---

## 🔧 Debug Tools - Código para Adicionar

### Logs de Debug Já Adicionados

✅ **Logs já foram adicionados ao CalendarPage!**

Os logs aparecerão automaticamente no console quando:
- A página carregar e verificar autenticação
- OAuth redirect acontecer com sucesso

**O que você verá no console:**

```
[DEBUG] OAuth Status Check: {
  authenticated: true/false,
  user: { id, email, name, picture },
  hasUser: true/false,
  timestamp: "2025-11-20T..."
}

[DEBUG] OAuth Success Handler: {
  authenticated: true/false,
  user: { id, email, name, picture },
  hasUser: true/false,
  hasTokens: true/false,
  timestamp: "2025-11-20T..."
}
```

**Se não aparecer:**
- Verifique se `NODE_ENV === 'development'`
- Verifique se o console não está filtrado

### Script de Debug Automatizado

✅ **Script criado em `DEBUG_OAUTH_SCRIPT.js`**

**Como usar:**
1. Abra o DevTools → Console
2. Cole o conteúdo completo de `DEBUG_OAUTH_SCRIPT.js`
3. Pressione Enter
4. O script executará todas as verificações automaticamente

**O script verifica:**
- ✅ Status OAuth (`/auth/oauth/status`)
- ✅ Listagem de eventos (`/api/google/calendar/events`)
- ✅ Cookies de sessão (`connect.sid`)
- ✅ Estado do React (instruções)

**Ou execute manualmente:**

```javascript
// Verificar status OAuth
fetch('https://goflow--magnetai-4h4a8.us-east4.hosted.app/auth/oauth/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('OAuth Status:', data))
  .catch(err => console.error('Error:', err));

// Verificar se consegue listar eventos
fetch('https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/google/calendar/events?maxResults=5', {
  credentials: 'include'
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => console.log('Events:', data))
  .catch(err => console.error('Error:', err));
```

---

## 🎯 Cenários e Soluções

### Cenário 1: Token não está sendo salvo no backend

**Sintomas:**
- OAuth redirect acontece
- `/auth/oauth/status` retorna `authenticated: false`
- Cookie `connect.sid` não existe ou está vazio

**Solução:**
1. Verificar logs do backend durante callback OAuth
2. Verificar se `storeTokens()` está sendo chamado
3. Verificar configuração de sessão (Redis, cookie settings)

**Verificar no Backend:**
```bash
# Ver logs do backend durante OAuth callback
# Procurar por: "OAuth authentication successful"
# Verificar se tokens estão sendo salvos em req.session
```

---

### Cenário 2: Token salvo, mas inválido/expirado

**Sintomas:**
- `/auth/oauth/status` retorna `authenticated: true`
- `/api/google/calendar/events` retorna `401 Unauthorized`

**Solução:**
1. Verificar se token tem escopos corretos
2. Verificar se token não expirou
3. Verificar se refresh token está funcionando

**Verificar Escopos:**
```javascript
// No backend, verificar req.session.tokens.scope
// Deve incluir: 'https://www.googleapis.com/auth/calendar.readonly'
```

---

### Cenário 3: Frontend não detecta estado autenticado

**Sintomas:**
- `/auth/oauth/status` retorna `authenticated: true`
- `isBackendAuthenticated` no React está `false`
- UI mostra "Fazer Login"

**Solução:**
1. Verificar se `getOAuthStatus()` está sendo chamado
2. Verificar se resposta está sendo processada corretamente
3. Verificar se estado está sendo atualizado

**Debug:**
```typescript
// Adicionar log após getOAuthStatus()
const status = await apiClient.getOAuthStatus();
console.log('[DEBUG] Status recebido:', status);
console.log('[DEBUG] authenticated:', status?.authenticated);
setIsBackendAuthenticated(status?.authenticated || false);
```

---

### Cenário 4: Endpoint de verificação retorna false

**Sintomas:**
- `GET /auth/oauth/status` retorna `{ authenticated: false }`
- Cookie existe mas sessão não tem tokens

**Solução:**
1. Verificar função `isAuthenticated()` no backend
2. Verificar se `req.session.tokens` existe
3. Verificar se sessão não expirou

**Verificar no Backend:**
```javascript
// Em goflow/src/utils/tokenManager.js
// Verificar função isAuthenticated()
// Deve verificar: req.session && req.session.tokens && req.session.user
```

---

### Cenário 5: Callback OAuth não está sendo chamado

**Sintomas:**
- Redirect para Google acontece
- Usuário autoriza
- Não volta para `/calendar?oauth_success=true`

**Solução:**
1. Verificar REDIRECT_URI configurado no Google Cloud Console
2. Verificar variável de ambiente `GOOGLE_REDIRECT_URI`
3. Verificar se URL de callback está correta

**Verificar:**
```bash
# No backend, verificar:
echo $GOOGLE_REDIRECT_URI
# Deve ser: https://goflow--magnetai-4h4a8.us-east4.hosted.app/auth/oauth/callback
```

---

## 📋 Checklist Completo

### Frontend (Browser)

- [ ] Console mostra "Login realizado com sucesso"?
- [ ] Network mostra `GET /auth/oauth/status` retornando `200`?
- [ ] Resposta de `/auth/oauth/status` tem `authenticated: true`?
- [ ] Cookie `connect.sid` existe e não expirou?
- [ ] React state `isBackendAuthenticated` está `true`?
- [ ] `GET /api/google/calendar/events` retorna `200` ou `401`?

### Backend (Logs)

- [ ] Log mostra "OAuth authentication successful"?
- [ ] Log mostra tokens sendo salvos em sessão?
- [ ] `req.session.tokens` existe após callback?
- [ ] `req.session.user` existe após callback?
- [ ] `isAuthenticated(req)` retorna `true`?

### Configuração

- [ ] `GOOGLE_REDIRECT_URI` está correto?
- [ ] REDIRECT_URI no Google Cloud Console está correto?
- [ ] Escopos incluem `calendar.readonly` e `calendar.events`?
- [ ] Cookie settings estão corretos (SameSite, Secure)?
- [ ] CORS está configurado para aceitar cookies?

---

## 🚀 Próximos Passos

1. **Execute o checklist acima** e marque o que está OK/errado
2. **Compartilhe os resultados** para identificar o ponto exato do problema
3. **Aplicaremos a correção** específica baseada nos resultados

---

## 📝 Notas

- Todos os logs de debug devem ser removidos antes de produção
- Use `process.env.NODE_ENV === 'development'` para logs condicionais
- Cookies podem não aparecer se `SameSite=None` e `Secure=true` não estiverem configurados corretamente

