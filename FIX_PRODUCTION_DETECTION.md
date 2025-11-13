# 🔧 Correção: Detecção Automática de Produção e chrome.runtime.lastError

## ❌ Problema

Mesmo após configurar variáveis de ambiente no `apphosting.yaml`, o frontend ainda estava tentando acessar `http://localhost:8080` em produção, causando:

1. **Erro de CORS**: Frontend em produção tentando acessar localhost
2. **Erro "message port closed"**: Requisições falhando antes de receber resposta
3. **Erro "chrome.runtime.lastError"**: Erros de extensões do Chrome não tratados

### Causa Raiz

O código estava usando `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'`, mas em produção, se a variável de ambiente não fosse aplicada corretamente (cache, build antigo, etc.), o código usaria o valor padrão `localhost`.

## ✅ Solução Implementada

### 1. Detecção Automática de Produção

**Arquivo**: `studio/src/lib/api-client.ts`

```typescript
// Detect production environment
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('hosted.app') || 
   window.location.hostname.includes('goflow.zone') ||
   process.env.NODE_ENV === 'production');

// Use production backend URL if in production and no explicit URL is set
const getDefaultApiUrl = () => {
  if (isProduction && !process.env.NEXT_PUBLIC_API_URL) {
    return 'https://goflow--magnetai-4h4a8.us-east4.hosted.app';
  }
  return 'http://localhost:8080';
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();
const USE_BACKEND_API = process.env.NEXT_PUBLIC_USE_BACKEND_API === 'true' || isProduction;
```

**Benefícios**:
- ✅ Detecta produção automaticamente pelo hostname
- ✅ Usa URL de produção mesmo sem variáveis de ambiente
- ✅ Fallback seguro para desenvolvimento

### 2. Tratamento de chrome.runtime.lastError

**Arquivo**: `studio/src/lib/error-handler.ts`

```typescript
// Handle chrome.runtime.lastError if chrome.runtime exists
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const originalSendMessage = chrome.runtime.sendMessage;
  if (originalSendMessage) {
    chrome.runtime.sendMessage = function(...args: any[]) {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        const wrappedCallback = function(response: any) {
          if (chrome.runtime.lastError) {
            // Handle the error, e.g., the port was closed
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error sending message:', chrome.runtime.lastError.message);
            }
            return; // Important to return if an error occurred
          }
          // Process the successful response
          callback(response);
        };
        args[args.length - 1] = wrappedCallback;
      }
      return originalSendMessage.apply(chrome.runtime, args);
    };
  }
}
```

**Padrão aplicado** (similar ao exemplo do usuário):
```javascript
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  if (chrome.runtime.lastError) {
    // Handle the error, e.g., the port was closed
    console.warn("Error sending message:", chrome.runtime.lastError.message);
    return; // Important to return if an error occurred
  }
  // Process the successful response
  console.log("Received response:", response);
});
```

### 3. Melhor Supressão de Erros

```typescript
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  
  // Check for chrome.runtime.lastError pattern
  const hasLastError = args.some(arg => 
    arg && typeof arg === 'object' && 
    ('lastError' in arg || 'runtime' in arg)
  );
  
  if (message.includes('runtime.lastError') || 
      message.includes('message port closed') ||
      message.includes('Unchecked runtime.lastError') ||
      hasLastError) {
    // Suppress Chrome extension errors
    return;
  }
  originalError.apply(console, args);
};
```

### 4. Logs de Debug

```typescript
// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('[API Client] Using API URL:', API_URL);
  console.log('[API Client] Use Backend API:', USE_BACKEND_API);
  console.log('[API Client] Is Production:', isProduction);
}
```

## 📋 Mudanças Aplicadas

### Frontend (studio)

**Commit**: `361edbf`

- ✅ Detecção automática de produção pelo hostname
- ✅ URL de produção usada automaticamente quando em produção
- ✅ Tratamento melhorado de `chrome.runtime.lastError`
- ✅ Logs de debug em desenvolvimento
- ✅ Supressão melhorada de erros de extensões do Chrome

## 🔍 Como Funciona

### Detecção de Produção

```typescript
// Detecta produção se:
// 1. Hostname contém 'hosted.app' (Firebase App Hosting)
// 2. Hostname contém 'goflow.zone' (domínio customizado)
// 3. NODE_ENV === 'production'
const isProduction = window.location.hostname.includes('hosted.app') || 
                     window.location.hostname.includes('goflow.zone') ||
                     process.env.NODE_ENV === 'production';
```

### Seleção de URL

```typescript
// Prioridade:
// 1. Variável de ambiente NEXT_PUBLIC_API_URL (se definida)
// 2. URL de produção (se em produção)
// 3. localhost:8080 (desenvolvimento)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (isProduction ? 'https://goflow--magnetai-4h4a8.us-east4.hosted.app' : 'http://localhost:8080');
```

## ✅ Benefícios

1. **Resiliência**: Funciona mesmo se variáveis de ambiente não forem aplicadas
2. **Detecção automática**: Não precisa configurar manualmente em cada ambiente
3. **Fallback seguro**: Sempre usa URL correta baseada no contexto
4. **Melhor debugging**: Logs claros em desenvolvimento
5. **Erros suprimidos**: Erros de extensões do Chrome não poluem o console

## 🧪 Testar Após Deploy

### 1. Verificar Detecção

No console do navegador (em produção):
```javascript
// Deve mostrar:
// [API Client] Using API URL: https://goflow--magnetai-4h4a8.us-east4.hosted.app
// [API Client] Use Backend API: true
// [API Client] Is Production: true
```

### 2. Testar Requisição

```javascript
// Deve funcionar sem erros de CORS
fetch('https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/v1/status')
  .then(r => r.json())
  .then(console.log)
```

### 3. Verificar Erros Suprimidos

- Erros de "message port closed" não devem aparecer no console
- Erros de "chrome.runtime.lastError" devem ser suprimidos
- Apenas erros reais da aplicação devem aparecer

## 📝 Arquivos Modificados

- `studio/src/lib/api-client.ts`
  - Detecção automática de produção
  - Seleção inteligente de URL
  - Logs de debug

- `studio/src/lib/error-handler.ts`
  - Tratamento de `chrome.runtime.lastError`
  - Supressão melhorada de erros
  - Wrapper para `chrome.runtime.sendMessage`

## ✅ Status

- ✅ Detecção automática implementada
- ✅ Tratamento de chrome.runtime.lastError implementado
- ✅ Logs de debug adicionados
- ✅ Deploy iniciado
- ⏳ Aguardando conclusão do deploy (5-10 minutos)

## 🚀 Próximos Passos

1. **Aguardar deploy concluir** (5-10 minutos)
2. **Testar página de calendário** em produção
3. **Verificar se erros de CORS desapareceram**
4. **Verificar se "message port closed" foi resolvido**
5. **Verificar se chrome.runtime.lastError foi suprimido**

---

**Data**: 2025-11-13
**Status**: ✅ Correções aplicadas e deploy iniciado

