# 🔴 Erro 400 Firebase Auth - Troubleshooting

**Data:** 2025-01-27  
**Erro:** `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=... 400 (Bad Request)`

---

## 🔍 Diagnóstico

O erro 400 no Firebase Auth indica que há um problema com a configuração do OAuth no Firebase Console. Este erro ocorre quando o Firebase tenta autenticar com Google usando `signInWithIdp`.

---

## ⚠️ Causas Comuns

### 1. Client ID OAuth não configurado no Firebase Console

**Problema:** O Firebase Auth precisa do Client ID OAuth configurado no Firebase Console.

**Solução:**
1. Acesse: [Firebase Console > Authentication > Sign-in method](https://console.firebase.google.com/project/magnetai-4h4a8/authentication/providers)
2. Clique em **Google**
3. Verifique se está **Enabled**
4. Em **Web client ID**, configure o Client ID do Google Cloud Console
5. Em **Web client secret**, configure o Client Secret do Google Cloud Console
6. Clique em **Save**

---

### 2. URIs de Redirecionamento não configuradas

**Problema:** As URIs de redirecionamento do Firebase Auth não estão configuradas no Google Cloud Console.

**Solução:**
1. Acesse: [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials?project=magnetai-4h4a8)
2. Selecione o Client ID OAuth configurado
3. Verifique se estas URIs estão em **Authorized redirect URIs**:
   ```
   https://studio--magnetai-4h4a8.us-east4.hosted.app/__/auth/handler
   https://goflow--magnetai-4h4a8.us-east4.hosted.app/__/auth/handler
   https://magnetai-4h4a8.firebaseapp.com/__/auth/handler
   http://localhost:3000/__/auth/handler
   http://localhost:8000/__/auth/handler
   ```

---

### 3. OAuth Consent Screen não configurado

**Problema:** O OAuth Consent Screen não está configurado corretamente.

**Solução:**
1. Acesse: [Google Cloud Console > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=magnetai-4h4a8)
2. Verifique se está configurado como **External**
3. Preencha:
   - **App name:** GoalFlow
   - **User support email:** seu email
   - **Developer contact:** seu email
4. Adicione **Scopes** necessários:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.events`
5. Adicione **Test users** (se em modo de teste)
6. Clique em **Save and Continue**

---

### 4. Domínios Autorizados no Firebase

**Problema:** O domínio não está autorizado no Firebase.

**Solução:**
1. Acesse: [Firebase Console > Authentication > Settings > Authorized domains](https://console.firebase.google.com/project/magnetai-4h4a8/authentication/settings)
2. Verifique se estes domínios estão listados:
   - `studio--magnetai-4h4a8.us-east4.hosted.app`
   - `goflow--magnetai-4h4a8.us-east4.hosted.app`
   - `magnetai-4h4a8.firebaseapp.com`
   - `localhost` (para desenvolvimento)
3. Se não estiverem, adicione-os

---

## 🔧 Verificação Passo a Passo

### Passo 1: Verificar Firebase Console

```bash
# Acesse Firebase Console
https://console.firebase.google.com/project/magnetai-4h4a8/authentication/providers
```

**Verificar:**
- [ ] Google provider está **Enabled**
- [ ] **Web client ID** está configurado (do Google Cloud Console)
- [ ] **Web client secret** está configurado (do Google Cloud Console)

---

### Passo 2: Verificar Google Cloud Console

```bash
# Acesse Google Cloud Console
https://console.cloud.google.com/apis/credentials?project=magnetai-4h4a8
```

**Verificar:**
- [ ] Client ID OAuth existe e está configurado
- [ ] URIs de redirecionamento incluem `/__/auth/handler`
- [ ] OAuth Consent Screen está configurado

---

### Passo 3: Verificar Código Frontend

**Arquivo:** `studio/src/firebase/config.ts`

```typescript
export const firebaseConfig = {
  "projectId": "magnetai-4h4a8",
  "appId": "1:210739580533:web:90a7f1063949457ded723c",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Deve ser: AIzaSyALRps1FyfrS8P3SxTEhpU-0m3Mb58k_1w
  "authDomain": "magnetai-4h4a8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "210739580533"
};
```

**Verificar:**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` está configurado
- [ ] `authDomain` está correto
- [ ] `projectId` está correto

---

## 🧪 Teste de Verificação

### Teste 1: Verificar Configuração do Firebase

```bash
# No console do navegador (DevTools)
console.log(firebase.app().options);
```

**Deve mostrar:**
- `apiKey`: `AIzaSyALRps1FyfrS8P3SxTEhpU-0m3Mb58k_1w`
- `authDomain`: `magnetai-4h4a8.firebaseapp.com`
- `projectId`: `magnetai-4h4a8`

---

### Teste 2: Verificar Erro Detalhado

No console do navegador, verifique a resposta completa do erro:

```javascript
// O erro 400 geralmente retorna um objeto com detalhes
// Verifique a aba Network > signInWithIdp > Response
```

**Erros comuns:**
- `INVALID_CLIENT`: Client ID não configurado no Firebase
- `INVALID_REDIRECT_URI`: URI de redirecionamento não autorizada
- `INVALID_REQUEST`: Request malformado

---

## ✅ Solução Rápida

### Configurar Client ID no Firebase Console:

1. **Acesse Firebase Console:**
   ```
   https://console.firebase.google.com/project/magnetai-4h4a8/authentication/providers
   ```

2. **Clique em Google**

3. **Configure:**
   - **Web client ID:** (do Google Cloud Console)
   - **Web client secret:** (do Google Cloud Console)
   - **Enable:** ✅

4. **Salve**

5. **Aguarde 1-2 minutos** para propagação

6. **Teste novamente**

---

## 📝 Checklist Completo

- [ ] Google provider habilitado no Firebase Console
- [ ] Web client ID configurado no Firebase Console
- [ ] Web client secret configurado no Firebase Console
- [ ] URIs `/__/auth/handler` configuradas no Google Cloud Console
- [ ] OAuth Consent Screen configurado
- [ ] Domínios autorizados no Firebase
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` configurado no frontend
- [ ] Testado após configuração

---

## 🔗 Links Úteis

- [Firebase Console - Authentication](https://console.firebase.google.com/project/magnetai-4h4a8/authentication/providers)
- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=magnetai-4h4a8)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=magnetai-4h4a8)

---

## 🎯 Próximos Passos

1. **Configurar Client ID no Firebase Console** (mais provável)
2. **Verificar URIs de redirecionamento**
3. **Testar após configuração**

---

**Última atualização:** 2025-01-27  
**Status:** ⚠️ **Aguardando configuração no Firebase Console**

