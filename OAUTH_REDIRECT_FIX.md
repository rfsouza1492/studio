# 🔧 Correção: Redirecionamento OAuth para /login em vez de /calendar

## ❌ Problema Identificado

Após fazer login OAuth no Google Calendar, o usuário estava sendo redirecionado para `/login` em vez de `/calendar` com os eventos.

**URL esperada:** `https://studio--magnetai-4h4a8.us-east4.hosted.app/calendar?oauth_success=true`  
**URL atual:** `https://studio--magnetai-4h4a8.us-east4.hosted.app/login`

---

## 🔍 Causa Raiz

O problema estava no `AuthContext.tsx` que verifica se o usuário está autenticado no **Firebase** e redireciona para `/login` se não estiver.

**Fluxo do problema:**
1. ✅ Usuário faz OAuth no backend (`/auth/oauth/login`)
2. ✅ Backend salva tokens OAuth na sessão
3. ✅ Backend redireciona para `/calendar?oauth_success=true`
4. ❌ `AuthContext` detecta que não há usuário Firebase autenticado
5. ❌ `AuthContext` redireciona para `/login` antes da página `/calendar` processar o OAuth

**Por que isso acontece?**
- OAuth do backend é **independente** do Firebase Auth
- OAuth do backend autentica para **Google Calendar API**
- Firebase Auth autentica para **acesso ao frontend**
- São dois sistemas de autenticação diferentes!

---

## ✅ Solução Aplicada

### Modificação no `AuthContext.tsx`

Adicionada verificação para **não redirecionar** quando estamos na página `/calendar` com `oauth_success=true`:

```typescript
// Check if we're handling OAuth callback from backend (oauth_success=true)
// Don't redirect in this case - let the calendar page handle OAuth flow
const searchParams = new URLSearchParams(window.location.search);
const oauthSuccess = searchParams.get('oauth_success') === 'true';
const isCalendarPage = pathname === '/calendar';

// If user is NOT logged in and is NOT on the login page, redirect to login.
// EXCEPT: Don't redirect if we're on calendar page with oauth_success (backend OAuth callback)
if (!user && pathname !== '/login' && !(isCalendarPage && oauthSuccess)) {
  router.replace('/login');
}
```

### O que mudou?

**Antes:**
- Qualquer página sem usuário Firebase → redireciona para `/login`
- Isso incluía `/calendar?oauth_success=true` ❌

**Depois:**
- Qualquer página sem usuário Firebase → redireciona para `/login`
- **EXCETO** `/calendar?oauth_success=true` → permite processar OAuth ✅

---

## 🔄 Fluxo Correto Agora

1. ✅ Usuário faz OAuth no backend (`/auth/oauth/login`)
2. ✅ Backend salva tokens OAuth na sessão
3. ✅ Backend redireciona para `/calendar?oauth_success=true`
4. ✅ `AuthContext` detecta `oauth_success=true` e **não redireciona**
5. ✅ Página `/calendar` processa o OAuth e carrega eventos
6. ✅ Eventos são exibidos na tela

---

## 📋 Verificações Adicionais

### Backend está correto?

O backend já estava configurado corretamente:

```javascript
// goflow/src/routes/auth.js linha 117-120
const frontendUrl = process.env.FRONTEND_URL || process.env.STUDIO_URL;
if (frontendUrl) {
  const redirectUrl = `${frontendUrl}/calendar?oauth_success=true`;
  return res.redirect(redirectUrl);
}
```

**Verificar variáveis de ambiente no backend:**
- `FRONTEND_URL` deve ser: `https://studio--magnetai-4h4a8.us-east4.hosted.app`
- OU `STUDIO_URL` deve ser: `https://studio--magnetai-4h4a8.us-east4.hosted.app`

### Frontend está correto?

A página `/calendar` já estava preparada para processar `oauth_success=true`:

```typescript
// studio/src/app/calendar/page.tsx linha 74-181
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth_success') === 'true') {
    // Processa OAuth e carrega eventos
  }
}, []);
```

---

## 🧪 Como Testar

1. **Acesse `/calendar`**
2. **Clique em "Fazer Login"**
3. **Complete o OAuth no Google**
4. **Verifique se é redirecionado para `/calendar?oauth_success=true`**
5. **Verifique se os eventos são carregados**
6. **Verifique se a URL muda para `/calendar` (sem query params)**

---

## 🚨 Se Ainda Não Funcionar

### Verificar Backend

```bash
# Verificar variáveis de ambiente
echo $FRONTEND_URL
echo $STUDIO_URL

# Deve retornar:
# https://studio--magnetai-4h4a8.us-east4.hosted.app
```

### Verificar Logs do Backend

```bash
# Procurar por:
# "OAuth authentication successful"
# "Redirect to frontend calendar page"
```

### Verificar Network Tab

1. DevTools → Network
2. Filtrar por "callback" ou "oauth"
3. Verificar se `GET /auth/oauth/callback` retorna `302 Redirect`
4. Verificar se o `Location` header é `/calendar?oauth_success=true`

---

## 📝 Resumo

| Item | Status |
|------|--------|
| **Problema identificado** | ✅ Sim |
| **Causa raiz encontrada** | ✅ Sim (AuthContext redirecionando) |
| **Correção aplicada** | ✅ Sim |
| **Backend verificado** | ✅ Sim (já estava correto) |
| **Frontend verificado** | ✅ Sim (já estava preparado) |
| **Pronto para testar** | ✅ Sim |

---

**Última atualização:** 2025-11-20  
**Status:** ✅ Correção aplicada - aguardando teste

