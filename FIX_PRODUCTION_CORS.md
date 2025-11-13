# 🔧 Correção: CORS em Produção - Frontend tentando acessar localhost

## ❌ Problema

O frontend em produção (`https://studio--magnetai-4h4a8.us-east4.hosted.app`) estava tentando acessar o backend em `http://localhost:8080`, causando:

1. **Erro de CORS**: `Access to fetch at 'http://localhost:8080/...' from origin 'https://studio--magnetai-4h4a8.us-east4.hosted.app' has been blocked by CORS policy`
2. **Erro de rede**: `Failed to load resource: net::ERR_FAILED`
3. **Erro "message port closed"**: Requisições falhando antes de receber resposta

### Causa Raiz

O `apphosting.yaml` do frontend não tinha as variáveis de ambiente `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_USE_BACKEND_API` configuradas, então o código estava usando o valor padrão (`http://localhost:8080`).

## ✅ Solução Implementada

### 1. Configurar Variáveis de Ambiente no Frontend

**Arquivo**: `studio/apphosting.yaml`

```yaml
env:
  # ... outras variáveis Firebase ...
  
  # Backend API Configuration (Production)
  - variable: NEXT_PUBLIC_API_URL
    value: https://goflow--magnetai-4h4a8.us-east4.hosted.app
  
  - variable: NEXT_PUBLIC_USE_BACKEND_API
    value: "true"
```

### 2. Atualizar CORS no Backend

**Arquivo**: `goflow/apphosting.yaml`

```yaml
env:
  # Security
  - variable: ALLOWED_ORIGINS
    value: http://localhost:8000,http://localhost:8080,https://goflow.zone,https://www.goflow.zone,https://studio--magnetai-4h4a8.us-east4.hosted.app
```

## 📋 Mudanças Aplicadas

### Frontend (studio)

**Commit**: `5cda21b`

- ✅ Adicionado `NEXT_PUBLIC_API_URL` apontando para backend de produção
- ✅ Habilitado `NEXT_PUBLIC_USE_BACKEND_API` em produção
- ✅ URL configurada: `https://goflow--magnetai-4h4a8.us-east4.hosted.app`

### Backend (goflow)

**Commit**: `de91396`

- ✅ Adicionado `https://studio--magnetai-4h4a8.us-east4.hosted.app` ao `ALLOWED_ORIGINS`
- ✅ Permite requisições do frontend de produção

## 🔍 Verificação

### Antes da Correção

```javascript
// Frontend em produção tentando acessar:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// ❌ Resultado: http://localhost:8080 (não funciona em produção)
```

### Depois da Correção

```javascript
// Frontend em produção usando variável de ambiente:
const API_URL = process.env.NEXT_PUBLIC_API_URL; 
// ✅ Resultado: https://goflow--magnetai-4h4a8.us-east4.hosted.app
```

## 🧪 Testar Após Deploy

### 1. Verificar Variáveis de Ambiente

Após o deploy, verifique no Firebase Console:
- Frontend → Settings → Environment Variables
- Deve ter `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_USE_BACKEND_API`

### 2. Testar Requisição

```bash
# No console do navegador (na página de produção)
fetch('https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/v1/status')
  .then(r => r.json())
  .then(console.log)
```

### 3. Verificar CORS

```bash
curl -I -H "Origin: https://studio--magnetai-4h4a8.us-east4.hosted.app" \
  https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/v1/status

# Deve retornar:
# Access-Control-Allow-Origin: https://studio--magnetai-4h4a8.us-east4.hosted.app
```

## 📝 Arquivos Modificados

- `studio/apphosting.yaml` - Adicionadas variáveis de ambiente de produção
- `goflow/apphosting.yaml` - Adicionada origem do frontend de produção

## ✅ Status

- ✅ Variáveis de ambiente configuradas no frontend
- ✅ CORS atualizado no backend
- ✅ Deploy iniciado
- ⏳ Aguardando conclusão do deploy (5-10 minutos)

## 🚀 Próximos Passos

1. **Aguardar deploy concluir** (5-10 minutos)
2. **Testar página de calendário** em produção
3. **Verificar se erros de CORS desapareceram**
4. **Verificar se "message port closed" foi resolvido**

---

**Data**: 2025-11-13
**Status**: ✅ Correções aplicadas e deploy iniciado

