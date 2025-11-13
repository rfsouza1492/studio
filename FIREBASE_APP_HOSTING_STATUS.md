# Firebase App Hosting - Status Completo

**Data:** 2025-11-12  
**Projeto:** magnetai-4h4a8  
**Status:** ✅ Configurado e rodando

---

## 🎯 Backends Configurados

### 1. Studio (Frontend)
- **Nome:** studio
- **Repositório:** rfsouza1492-studio
- **URL Pública:** https://studio--magnetai-4h4a8.us-east4.hosted.app
- **URL Cloud Run:** https://studio-210739580533.us-east4.run.app
- **Região:** us-east4
- **Último Deploy:** 2025-11-12 19:46:32 (3 horas atrás)
- **Runtime:** Node.js 18
- **Service Account:** firebase-app-hosting-compute@magnetai-4h4a8.iam.gserviceaccount.com

### 2. GoFlow (Backend)
- **Nome:** goflow
- **Repositório:** rfsouza1492-goflow
- **URL Pública:** https://goflow--magnetai-4h4a8.us-east4.hosted.app
- **Região:** us-east4
- **Último Deploy:** 2025-11-12 08:08:50
- **Service Account:** firebase-app-hosting-compute@magnetai-4h4a8.iam.gserviceaccount.com

---

## 📋 Configuração Atual

### apphosting.yaml

```yaml
runtime: nodejs18
entrypoint: npm start
maxInstances: 1

env:
  - NEXT_PUBLIC_FIREBASE_API_KEY: AIzaSyALRps1FyfrS8P3SxTEhpU-0m3Mb58k_1w
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: magnetai-4h4a8.firebaseapp.com
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID: magnetai-4h4a8
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: magnetai-4h4a8.firebasestorage.app
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 210739580533
  - NEXT_PUBLIC_FIREBASE_APP_ID: 1:210739580533:web:90a7f1063949457ded723c
```

### .firebaserc

```json
{
  "projects": {
    "default": "magnetai-4h4a8"
  }
}
```

### firebase.json

```json
{
  "firestore": {
    "database": "(default)",
    "location": "nam5",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  },
  "functions": {
    "source": "lib"
  }
}
```

---

## 🚀 Como Fazer Deploy

### Opção 1: Deploy Automático (Recomendado)

Qualquer push para `main` dispara deploy automático:

```bash
cd studio
git add .
git commit -m "feat: suas mudanças"
git push origin main

# Firebase App Hosting detecta o push e faz deploy automático
# Aguarde 5-10 minutos
```

### Opção 2: Deploy Manual via CLI

```bash
cd studio
firebase apphosting:backends:deploy studio
```

### Opção 3: Deploy via Console

1. Acesse: https://console.firebase.google.com/project/magnetai-4h4a8/apphosting
2. Selecione backend "studio"
3. Clique em "Deploy"
4. Selecione branch ou commit
5. Aguarde build e deploy

---

## 📊 Histórico de Deploys

### Versões Ativas (Cloud Run)

O Cloud Run mantém múltiplas revisões:

```
studio-build-2025-11-06-000 (0% tráfego)
studio-build-2025-11-06-001 (0% tráfego)
studio-build-2025-11-06-002 (0% tráfego)
...
studio-build-2025-11-07-004 (0% tráfego)
```

**Nota:** Todas com 0% de tráfego indica que pode haver uma versão mais recente recebendo 100% do tráfego.

---

## 🔍 Verificar Status

### Via CLI

```bash
# Listar backends
firebase apphosting:backends:list

# Ver detalhes do studio
firebase apphosting:backends:get studio

# Ver serviço no Cloud Run
gcloud run services describe studio --region=us-east4 --project=magnetai-4h4a8
```

### Via Console

1. **Firebase Console:** https://console.firebase.google.com/project/magnetai-4h4a8/apphosting
2. **Cloud Run Console:** https://console.cloud.google.com/run?project=magnetai-4h4a8

---

## 🧪 Testar Aplicação

### URLs Disponíveis

1. **Produção:** https://studio--magnetai-4h4a8.us-east4.hosted.app
2. **Cloud Run Direto:** https://studio-210739580533.us-east4.run.app
3. **Local:** http://localhost:3000

### Teste Rápido

```bash
# Testar produção
curl -I https://studio--magnetai-4h4a8.us-east4.hosted.app

# Testar local
curl -I http://localhost:3000
```

---

## 📝 Comandos Úteis

### Backends

```bash
# Listar backends
firebase apphosting:backends:list

# Ver detalhes
firebase apphosting:backends:get studio

# Deploy
firebase apphosting:backends:deploy studio

# Deletar (cuidado!)
firebase apphosting:backends:delete studio
```

### Cloud Run

```bash
# Descrever serviço
gcloud run services describe studio --region=us-east4

# Ver logs
gcloud run services logs read studio --region=us-east4 --limit=50

# Listar revisões
gcloud run revisions list --service=studio --region=us-east4

# Ver tráfego
gcloud run services describe studio --region=us-east4 --format="value(status.traffic)"
```

### Firestore

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy tudo
firebase deploy
```

---

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente Atuais

Configuradas em `apphosting.yaml`:

- ✅ NEXT_PUBLIC_FIREBASE_API_KEY
- ✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
- ✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- ✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- ✅ NEXT_PUBLIC_FIREBASE_APP_ID

### Adicionar Mais Variáveis

Editar `apphosting.yaml`:

```yaml
env:
  - variable: NEXT_PUBLIC_API_URL
    value: https://api.example.com
  
  - variable: NODE_ENV
    value: production
```

---

## 🔒 Segurança

### Service Account

```
firebase-app-hosting-compute@magnetai-4h4a8.iam.gserviceaccount.com
```

**Permissões:**
- Cloud Run Invoker
- Firestore User
- Storage Object Viewer

### IAM Roles

Para verificar permissões:

```bash
gcloud projects get-iam-policy magnetai-4h4a8 \
  --flatten="bindings[].members" \
  --filter="bindings.members:firebase-app-hosting-compute@magnetai-4h4a8.iam.gserviceaccount.com"
```

---

## 💰 Custos

### Firebase App Hosting

- **Free Tier:** Incluído no plano Blaze
- **Cloud Run:** Pay-per-use
  - CPU: $0.00002400/vCPU-second
  - Memory: $0.00000250/GiB-second
  - Requests: $0.40/million

### Estimativa Mensal

Com tráfego baixo/médio:
- **Cloud Run:** $5-20/mês
- **Firestore:** Free tier (até 50k reads/day)
- **Storage:** Free tier (até 5GB)

**Total estimado:** $5-20/mês

---

## 📊 Monitoramento

### Logs

```bash
# Ver logs do Cloud Run
gcloud run services logs read studio --region=us-east4 --limit=100

# Ver logs do Firebase
firebase apphosting:backends:logs studio
```

### Métricas

Acesse Cloud Run Console para ver:
- Requests/segundo
- Latência
- Erros
- CPU/Memory usage

**URL:** https://console.cloud.google.com/run/detail/us-east4/studio?project=magnetai-4h4a8

---

## ✅ Status Atual

- ✅ Backend "studio" configurado
- ✅ Conectado ao repositório rfsouza1492/studio
- ✅ Último deploy: 3 horas atrás
- ✅ URL pública funcionando
- ✅ Cloud Run service ativo
- ✅ Variáveis de ambiente configuradas

---

## 🔄 Próximos Passos

### Para Deploy das Correções

1. **Commit suas mudanças:**
   ```bash
   cd studio
   git status
   git add .
   git commit -m "fix: correções de hydration e popup blocked"
   ```

2. **Push para main:**
   ```bash
   git push origin main
   ```

3. **Aguardar deploy automático:**
   - Firebase detecta o push
   - Inicia build automaticamente
   - Deploy em 5-10 minutos

4. **Verificar:**
   ```bash
   # Aguardar alguns minutos
   curl -I https://studio--magnetai-4h4a8.us-east4.hosted.app
   ```

---

**Status:** ✅ Firebase App Hosting configurado e funcional  
**Próxima Ação:** Push para main para deploy automático
