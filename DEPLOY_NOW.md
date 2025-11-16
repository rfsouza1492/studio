# 🚀 Deploy Manual - Studio Frontend

## ✅ Status Atual

- **Git:** Todos os commits já estão em `origin/main` ✅
- **Último commit:** `309a924 chore(deps): align eslint-config-next with next 14`
- **Commits importantes:**
  - `8ac7a7f` - Fix escape de aspas no inline script (resolve erro de sintaxe)
  - `6610f8d` - Remove dupla registro de error handlers
  - `65ddd58` - Fix redirect OAuth para /login

## 🔧 Como Fazer Deploy

### Opção 1: Deploy Automático via Firebase App Hosting (Recomendado)

O Firebase App Hosting deve detectar automaticamente o push para `main` e fazer o deploy.

**Verificar status:**
1. Acesse: https://console.firebase.google.com/project/magnetai-4h4a8/apphosting
2. Procure pelo backend conectado ao repositório `rfsouza1492/studio`
3. Verifique o status do último deploy
4. Se estiver "Building" ou "Deploying", aguarde terminar (5-10 min)
5. Se não iniciou automaticamente, clique em "Redeploy" ou "Trigger rollout"

### Opção 2: Deploy Manual via Firebase CLI

Se o deploy automático não funcionar:

```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Instalar Firebase CLI (se não tiver)
# npm install -g firebase-tools

# Login no Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

### Opção 3: Forçar Novo Deploy via Git

Se o Firebase não detectou o push:

```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Fazer um commit vazio para forçar trigger
git commit --allow-empty -m "chore: trigger deploy"
git push origin main
```

## 📊 Verificar Deploy

### Depois do deploy:

1. **Aguarde 5-10 minutos** para o build e deploy
2. **Acesse a URL:** https://studio--magnetai-4h4a8.us-east4.hosted.app/calendar
3. **Verifique:**
   - Página carrega sem erro de sintaxe
   - Console está limpo (erros de extensão suprimidos)
   - OAuth redirect funciona (não vai para /login)
   - Eventos são carregados após OAuth

## 🔍 Se o Deploy Falhar

1. **Firebase Console** → App Hosting → Seu backend → **Build logs**
2. Verifique erros de build:
   - Erros de TypeScript
   - Erros de dependências
   - Erros de lint
3. Se houver erro, corrija e faça novo push

## 📝 Checklist Pós-Deploy

- [ ] Página `/calendar` carrega sem erro
- [ ] Console limpo (sem erros de sintaxe)
- [ ] OAuth redirect funciona (/calendar?oauth_success=true)
- [ ] Eventos são carregados após OAuth
- [ ] Erros de extensão Chrome suprimidos
- [ ] 401 errors suprimidos no console

---

**Última atualização:** 2025-11-20  
**Próximo passo:** Verificar Firebase Console ou fazer deploy manual

