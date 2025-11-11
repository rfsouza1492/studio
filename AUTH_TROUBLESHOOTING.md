# Guia de Troubleshooting - Autenticação Firebase

## ✅ Problema Resolvido: Popup Fechado

### Erro Anterior
```
FirebaseError: Firebase: Error (auth/popup-closed-by-user)
```

### Solução Aplicada
✅ Erro agora é tratado silenciosamente  
✅ Usuário pode cancelar login sem ver mensagem de erro  
✅ Mensagens amigáveis para erros reais

---

## 🔐 Problemas Comuns de Autenticação

### 1. Popup Fechado pelo Usuário ✅ CORRIGIDO
**Sintoma**: Erro "auth/popup-closed-by-user"  
**Causa**: Usuário fecha o popup de login do Google antes de completar  
**Solução**: 
- Agora tratado automaticamente
- Não mostra erro (é comportamento normal)
- Usuário pode tentar novamente quando quiser

---

### 2. Popup Bloqueado pelo Navegador
**Sintoma**: Popup não abre ou erro "auth/popup-blocked"  
**Causa**: Navegador bloqueou o popup de autenticação  
**Solução**:
1. Permitir popups no navegador para `localhost:8000`
2. Clicar no ícone de popup bloqueado na barra de endereço
3. Selecionar "Sempre permitir popups"
4. Tentar login novamente

**Chrome**:
```
Configurações > Privacidade e segurança > 
Configurações do site > Pop-ups e redirecionamentos > 
Adicionar localhost:8000 como permitido
```

---

### 3. Erro de Rede
**Sintoma**: "auth/network-request-failed"  
**Causa**: Sem conexão com internet ou problema de rede  
**Solução**:
1. Verificar conexão com internet
2. Verificar se Firebase está acessível
3. Tentar novamente após restabelecer conexão
4. Verificar firewall/VPN

---

### 4. Credenciais Inválidas
**Sintoma**: "auth/invalid-credential" ou "auth/user-not-found"  
**Causa**: Configuração incorreta do Firebase  
**Solução**:
1. Verificar arquivo `.env.local`
2. Confirmar credenciais do Firebase Console
3. Verificar se o projeto Firebase está ativo

---

### 5. Domínio Não Autorizado
**Sintoma**: "auth/unauthorized-domain"  
**Causa**: Domínio não está na lista de domínios autorizados do Firebase  
**Solução**:
1. Ir para Firebase Console
2. Authentication > Settings > Authorized domains
3. Adicionar `localhost` e `localhost:8000`
4. Salvar e tentar novamente

---

## 🧪 Como Testar o Login

### Teste 1: Login Bem-Sucedido
```
1. Clicar em "Entrar"
2. Popup do Google abre
3. Selecionar conta Google
4. Permitir acesso
5. ✅ Redirecionado para home page
6. ✅ Avatar aparece no header
```

### Teste 2: Cancelar Login (Agora Funciona!)
```
1. Clicar em "Entrar"
2. Popup do Google abre
3. Fechar o popup (X ou ESC)
4. ✅ Nenhum erro mostrado
5. ✅ Pode tentar novamente
```

### Teste 3: Popup Bloqueado
```
1. Clicar em "Entrar"
2. Popup bloqueado pelo navegador
3. ✅ Toast mostra: "Popup bloqueado. Por favor, permita popups..."
4. Permitir popups
5. Tentar novamente
```

---

## 🔧 Configuração do Firebase

### Verificar .env.local
```bash
# Deve conter (não commitar!):
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

### Verificar Firebase Console
1. **Authentication habilitado**
   - Firebase Console > Build > Authentication
   - Sign-in method > Google > Enabled

2. **Domínios autorizados**
   - Authentication > Settings > Authorized domains
   - Incluir: `localhost`, domínio de produção

3. **APIs habilitadas**
   - Google Cloud Console
   - Identity Toolkit API: Enabled
   - Google Calendar API: Enabled (para feature calendar)

---

## 🐛 Debug Mode

### Ativar Logs Detalhados

**No navegador (Console DevTools)**:
```javascript
localStorage.debug = 'firebaseui:*'
```

**Ver logs do AuthContext**:
```
npm run dev
// Logs aparecem no terminal e no console do navegador
```

### Verificar Estado da Autenticação
```javascript
// No Console do navegador:
firebase.auth().currentUser
// Deve retornar o usuário ou null
```

---

## 📊 Erros Tratados Automaticamente

| Código do Erro | Mensagem ao Usuário | Ação |
|----------------|---------------------|------|
| `auth/popup-closed-by-user` | (nenhuma) | Silenciar |
| `auth/popup-blocked` | "Popup bloqueado..." | Toast vermelho |
| `auth/network-request-failed` | "Erro de conexão..." | Toast vermelho |
| Outros | "Erro ao fazer login..." | Toast vermelho |

---

## 🎯 Checklist de Diagnóstico

### Antes de Reportar Problema

- [ ] Popup está permitido no navegador?
- [ ] Está conectado à internet?
- [ ] Firebase Console está acessível?
- [ ] Credenciais no `.env.local` estão corretas?
- [ ] `localhost` está nos domínios autorizados?
- [ ] Tentou em modo anônimo/incógnito?
- [ ] Limpou cache e cookies?
- [ ] Tentou outro navegador?

### Se Ainda Não Funciona

1. **Verificar Console do Navegador** (F12)
   - Procurar erros em vermelho
   - Copiar stack trace completo

2. **Verificar Network Tab**
   - Verificar requisições para `identitytoolkit.googleapis.com`
   - Status code das requisições
   - Response das APIs

3. **Verificar Terminal**
   - Logs do Next.js
   - Erros de compilação

---

## 🔍 Testes de Integração

### Fluxo Completo com Feature HubSpot

```
1. ✅ Fazer login com Google
2. ✅ Ver botão "Importar HubSpot" habilitado
3. ✅ Clicar no botão
4. ✅ Dialog abre mostrando 52 tarefas
5. ✅ Selecionar projetos
6. ✅ Importar tarefas
7. ✅ Ver toast de sucesso
8. ✅ Verificar metas criadas na home page
```

---

## 📝 Logs Esperados

### Login Bem-Sucedido (Development)
```
[Next.js] ✓ Compiled /login in 150ms
[AuthContext] User logged in
[Firebase] Auth state changed: user authenticated
```

### Login Cancelado (Development)
```
[AuthContext] Login cancelled by user
// Nenhum erro mostrado ao usuário
```

### Erro de Rede
```
[AuthContext] Error signing in with Google: FirebaseError: network-request-failed
[Toast] Erro de conexão. Verifique sua internet...
```

---

## 🚀 Performance

### Métricas Esperadas
- **Tempo para abrir popup**: < 500ms
- **Tempo total de login**: < 3s
- **Redirecionamento pós-login**: < 100ms

### Se Login Estiver Lento
1. Verificar conexão com internet
2. Verificar se há muitas extensões no navegador
3. Limpar cache do navegador
4. Verificar CPU/memória disponível

---

## 💡 Dicas Profissionais

### Para Desenvolvimento
```bash
# Sempre usar HTTPS em produção
# localhost pode usar HTTP

# Manter Firebase SDK atualizado
npm update firebase

# Monitorar quotas do Firebase
# Firebase Console > Usage and billing
```

### Para Produção
```bash
# Configurar domínio personalizado
# Adicionar domínio aos Authorized domains
# Usar HTTPS obrigatoriamente
# Configurar rate limiting
# Monitorar logs de erro
```

---

## 📞 Suporte

### Recursos Úteis
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [Common Errors](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-authentication)

### Contato
- **Docs do Projeto**: Ver arquivos `.md` no repositório
- **Issues**: GitHub Issues
- **Logs**: Verificar console e terminal

---

**Última atualização**: 11 de novembro de 2025  
**Versão**: 1.1.0  
**Status**: ✅ Todos os erros comuns tratados

