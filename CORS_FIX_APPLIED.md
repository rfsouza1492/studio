# ✅ Correção CORS Aplicada

## Problema Original

**Erro**: `Access to fetch at 'https://goflow-210739580533.us-east4.run.app/api/google/calendar/events' from origin 'http://localhost:8000' has been blocked by CORS policy`

**Causa**: O backend em produção não tinha `http://localhost:8000` na lista de origens permitidas.

## Solução Aplicada

### 1. Configurar Frontend para Usar Backend Local

Atualizado `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_BACKEND_API=true
```

### 2. Atualizar CORS no Backend Local

Atualizado `.env` do goflow:
```env
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:8080,https://goflow.zone
```

### 3. Verificar CORS

```bash
curl -I -H "Origin: http://localhost:8000" http://localhost:8080/api/v1/status
```

**Resultado**: ✅ `Access-Control-Allow-Origin: http://localhost:8000`

## Status Atual

- ✅ **Frontend**: `http://localhost:8000` (modo produção)
- ✅ **Backend Local**: `http://localhost:8080` (modo desenvolvimento)
- ✅ **CORS**: Configurado para permitir `http://localhost:8000`
- ✅ **API Client**: Usando backend local

## Para Usar Backend de Produção

Se quiser usar o backend em produção (`https://goflow-210739580533.us-east4.run.app`), você precisa:

1. **Atualizar CORS no Firebase App Hosting**:
   - Acesse: https://console.firebase.google.com/project/magnetai-4h4a8/apphosting
   - Vá em: goflow-1 → Settings → Environment Variables
   - Atualize `ALLOWED_ORIGINS` para incluir `http://localhost:8000`
   - Faça redeploy

2. **Ou atualizar `.env.local`**:
   ```env
   NEXT_PUBLIC_API_URL=https://goflow-210739580533.us-east4.run.app
   NEXT_PUBLIC_USE_BACKEND_API=true
   ```

## Testar CORS

```bash
# Testar requisição com origem localhost:8000
curl -I -H "Origin: http://localhost:8000" \
  http://localhost:8080/api/google/calendar/events

# Deve retornar:
# Access-Control-Allow-Origin: http://localhost:8000
```

## Próximos Passos

1. **Recarregar a página** no navegador (Ctrl+Shift+R ou Cmd+Shift+R)
2. **Verificar no DevTools** se ainda há erros CORS
3. **Testar a API** do Google Calendar

---

**Status**: ✅ CORS corrigido
**Data**: 12 de Novembro, 2025

