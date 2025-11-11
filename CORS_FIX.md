# Como Resolver Erro de CORS do Backend GoFlow

## 🐛 Erro

```
Access to fetch at 'https://goflow-210739580533.us-east4.run.app/api/google/calendar/events'
from origin 'http://localhost:8000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 📋 O Que É CORS?

**CORS** (Cross-Origin Resource Sharing) é uma política de segurança dos navegadores que impede que um site faça requisições para outro domínio diferente, a menos que o servidor de destino permita explicitamente.

### Por Que o Erro Acontece?

- **Frontend (Studio)**: `http://localhost:8000`
- **Backend (GoFlow)**: `https://goflow-210739580533.us-east4.run.app`

São domínios diferentes → Navegador bloqueia por segurança!

## ✅ Solução 1: Configurar CORS no Backend (RECOMENDADO)

O backend GoFlow já tem configuração de CORS, mas pode precisar incluir `localhost:8000`.

### Arquivo: `goflow/src/middleware/security.js`

```javascript
const corsConfig = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',  // ← Adicionar esta linha
    'http://localhost:8080',
    process.env.FRONTEND_URL,
    // Adicione outros domínios conforme necessário
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Aplicar a Mudança

```bash
# 1. Editar o arquivo
cd /Users/rafaelsouza/Development/GCP/goflow
# Edite src/middleware/security.js

# 2. Reiniciar o servidor local
npm run dev

# 3. OU fazer deploy no Cloud Run
gcloud run deploy goflow ...
```

## ✅ Solução 2: Usar Variável de Ambiente

### Adicionar ao `.env` do GoFlow

```bash
# goflow/.env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8080
```

### Código (security.js)

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

const corsConfig = cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## ✅ Solução 3: Proxy no Next.js (Temporário)

Se você não tem acesso ao backend agora, pode criar um proxy no Next.js.

### Arquivo: `studio/next.config.js`

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/goflow/:path*',
        destination: 'https://goflow-210739580533.us-east4.run.app/api/:path*',
      },
    ];
  },
};
```

### Atualizar API Client

```typescript
// studio/src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_USE_BACKEND_API === 'true'
  ? '/api/goflow'  // Usa proxy local
  : 'http://localhost:8080';  // Desenvolvimento local
```

## ✅ Solução 4: Desabilitar Backend Temporariamente

Se você só quer testar a feature de importação HubSpot sem o backend:

### Arquivo: `studio/.env.local`

```bash
# Desabilitar backend API (usa apenas Firebase)
NEXT_PUBLIC_USE_BACKEND_API=false
```

Isso faz o sistema usar **apenas Firebase** para auth e dados, sem chamar o backend GoFlow.

## 🔧 Verificar Se CORS Está Configurado

### 1. Testar com curl

```bash
curl -I -X OPTIONS \
  -H "Origin: http://localhost:8000" \
  -H "Access-Control-Request-Method: GET" \
  https://goflow-210739580533.us-east4.run.app/api/google/calendar/events
```

**Resposta esperada:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:8000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Verificar no DevTools

1. Abrir DevTools (F12)
2. Network tab
3. Fazer uma requisição
4. Ver a requisição OPTIONS (preflight)
5. Verificar headers de resposta

**Headers esperados:**
```
Access-Control-Allow-Origin: http://localhost:8000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## 🎯 Qual Solução Usar?

### Desenvolvimento Local

**Melhor opção**: Solução 4 (desabilitar backend)
```bash
# .env.local
NEXT_PUBLIC_USE_BACKEND_API=false
```

**Por quê?**
- ✅ Mais rápido para desenvolver
- ✅ Firebase já tem tudo que precisa
- ✅ Sem problemas de CORS
- ✅ Sem depender do backend

### Produção

**Melhor opção**: Solução 1 (configurar CORS no backend)
```javascript
// Adicionar origem do frontend de produção
origin: [
  'https://seu-dominio.web.app',
  'https://seu-dominio.firebaseapp.com',
],
```

## 📝 Checklist de Correção

- [ ] Identificar qual solução usar (dev ou prod)
- [ ] Aplicar mudança no backend OU desabilitar backend
- [ ] Reiniciar servidor(es)
- [ ] Testar com curl (backend habilitado)
- [ ] Testar no navegador
- [ ] Verificar que requisições passam
- [ ] Verificar que dados são retornados

## 🐛 Troubleshooting

### Ainda vendo erro CORS após mudança?

1. **Limpar cache do navegador**
   - Chrome: DevTools → Network → Disable cache
   - Ou usar modo anônimo

2. **Verificar se backend foi reiniciado**
   ```bash
   # Cloud Run demora ~30s para atualizar
   # Local: verificar se processo foi reiniciado
   ```

3. **Verificar variáveis de ambiente**
   ```bash
   # No terminal do backend
   echo $ALLOWED_ORIGINS
   ```

4. **Verificar logs do backend**
   ```bash
   # Cloud Run
   gcloud run logs read goflow --limit 50
   
   # Local
   # Ver terminal onde npm run dev está rodando
   ```

### Erro persiste?

**Solução definitiva para desenvolvimento**: Desabilitar backend!

```bash
# studio/.env.local
NEXT_PUBLIC_USE_BACKEND_API=false
```

Isso garante que:
- ✅ Feature de importação funciona 100%
- ✅ Auth funciona via Firebase
- ✅ Dados salvos no Firestore
- ✅ Sem problemas de CORS

## 🎯 Resultado Esperado

### Antes (com erro):
```
❌ Failed to load events: ApiError: Failed to fetch
❌ Access to fetch blocked by CORS policy
```

### Depois (funcionando):
```
✅ Events loaded successfully
✅ No CORS errors in console
✅ Importação de tarefas funciona perfeitamente
```

## 📚 Referências

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [Next.js Rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites)

---

**TL;DR**: Para desenvolvimento, desabilite o backend com `NEXT_PUBLIC_USE_BACKEND_API=false` no `.env.local` 🎯

