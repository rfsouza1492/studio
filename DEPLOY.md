# Deploy do GoalFlow (studio) no Firebase App Hosting

## Status do Projeto

✅ Repositório clonado  
✅ `apphosting.yaml` configurado  
✅ Scripts `build` e `start` presentes  
✅ Next.js 15 configurado  

## Passos para Deploy

### 1. Conectar Repositório ao Firebase App Hosting

**Via Firebase Console:**

1. Acesse: https://console.firebase.google.com/project/magnetai-4h4a8/apphosting
2. Clique em **"Create backend"** ou **"Add backend"**
3. Selecione **"Connect repository"**
4. Escolha **GitHub** como provedor
5. Autorize o acesso ao repositório `rfsouza1492/studio`
6. Selecione o repositório: `rfsouza1492/studio`
7. Selecione o branch: `main`

### 2. Configurar Build Settings

O Firebase App Hosting deve detectar automaticamente:
- **Framework:** Next.js
- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Output directory:** `.next` (gerado automaticamente)

Se não detectar automaticamente, configure manualmente:
- **Build command:** `NODE_ENV=production npm run build`
- **Start command:** `npm start`
- **Node version:** 18 ou superior

### 3. Variáveis de Ambiente (se necessário)

Se o app precisar de variáveis de ambiente, adicione no Firebase Console:

```
NEXT_PUBLIC_API_URL=https://goflow.zone
# Ou se separar backend:
# NEXT_PUBLIC_API_URL=https://api.goflow.zone
```

### 4. Deploy

Após conectar o repositório:
1. O Firebase fará o build automaticamente
2. Aguarde o deploy terminar (pode levar 5-10 minutos)
3. Você receberá uma URL temporária tipo: `https://studio-xxxxx.web.app`

### 5. Configurar Domínio Personalizado

Após o deploy bem-sucedido:

1. No Firebase Console → App Hosting → Seu backend → **Domains**
2. Clique em **"Add custom domain"**
3. Digite: `goflow.zone` ou `app.goflow.zone`
4. Siga as instruções de DNS:
   - Adicione o registro TXT para verificação
   - Adicione o registro CNAME ou A conforme instruído

**Nota:** Se `goflow.zone` já estiver apontando para o backend (`goflow`), você pode:
- Usar `app.goflow.zone` para o frontend
- Ou mover o backend para `api.goflow.zone` e usar `goflow.zone` para o frontend

## Estrutura Recomendada de Domínios

```
goflow.zone → Frontend (Next.js - studio) 
api.goflow.zone → Backend (Express.js - goflow)
```

Ou:

```
app.goflow.zone → Frontend (Next.js - studio)
goflow.zone → Backend (Express.js - goflow) 
```

## Verificar Deploy

Após o deploy, teste:

```bash
# Verificar se está rodando
curl https://sua-url-do-firebase.app

# Ou acesse no navegador
```

## Troubleshooting

### Build Falha

1. Verifique os logs no Firebase Console
2. Teste localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`

### Erro de Variáveis de Ambiente

1. Adicione variáveis no Firebase Console
2. Use `NEXT_PUBLIC_*` para variáveis acessíveis no cliente

### Domínio Não Funciona

1. Verifique os registros DNS com `dig goflow.zone`
2. Aguarde propagação DNS (pode levar até 48h)
3. Verifique se o domínio está verificada no Firebase

## Comandos Úteis

```bash
# Testar build localmente
cd /Users/rafaelsouza/Development/GCP/studio
npm install
npm run build
npm start

# Verificar configuração
cat apphosting.yaml
cat package.json | grep -A 5 '"scripts"'
```

## Próximos Passos

1. ⏳ Conectar repositório no Firebase Console
2. ⏳ Aguardar deploy automático
3. ⏳ Configurar domínio personalizado
4. ⏳ Testar aplicação em produção
