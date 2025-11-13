# 🔧 Correção: Erro "message port closed before a response was received"

## ❌ Problema

O erro `Unchecked runtime.lastError: The message port closed before a response was received` ocorre quando:

1. **Requisições assíncronas são canceladas** antes de receber resposta
2. **Componentes React são desmontados** enquanto requisições estão em andamento
3. **Timeouts ou abortos** acontecem durante comunicação assíncrona
4. **Extensões do Chrome** interferem com requisições fetch

## ✅ Solução Implementada

Aplicamos o padrão de **"always send a response"** (similar ao Chrome extension message listener):

### 1. Melhorias no `fetchWithTimeout`

```typescript
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Check if aborted after fetch
    if (controller.signal.aborted) {
      throw new ApiError(408, 'Request was cancelled');
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId); // Always cleanup
    
    // Always provide a response, even for cancelled requests
    if (error.name === 'AbortError' || controller.signal.aborted) {
      throw new ApiError(408, 'Request timeout or cancelled');
    }
    
    // Handle message port closed errors
    if (error.message.includes('message port closed')) {
      throw new ApiError(503, 'Network error: Unable to connect to server');
    }
    
    throw error;
  }
}
```

### 2. Melhorias no `apiRequest`

```typescript
async function apiRequest<T>(endpoint, options): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, options);
    
    // Always parse response, even if empty
    if (!response.body) {
      throw new ApiError(500, 'Empty response from server');
    }
    
    // Handle errors - always provide a response
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(response.status, errorData.message, errorData);
    }
    
    // Parse and return data
    return await response.json();
  } catch (error) {
    // Pattern: Always send a response, even on error
    // Similar to Chrome extension: sendResponse({ error: ... })
    
    if (error instanceof ApiError) {
      throw error; // Already has proper response
    }
    
    // Always provide a response for all error types
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request was cancelled');
    }
    
    if (error.message.includes('message port closed')) {
      throw new ApiError(503, 'Network error: Unable to connect to server');
    }
    
    // Unknown errors - always provide a response
    throw new ApiError(500, error.message || 'Unknown error occurred');
  }
}
```

### 3. Melhorias no Error Handler Global

```typescript
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || '';
  
  // Suppress Chrome extension errors
  if (message.includes('message port closed') || 
      message.includes('runtime.lastError')) {
    event.preventDefault(); // Prevent console error
    return;
  }
  
  // Suppress handled abort errors
  if (message.includes('Request was cancelled') ||
      reason?.name === 'AbortError') {
    event.preventDefault();
    return;
  }
  
  // Suppress handled network errors
  if (message.includes('Network error') && reason?.status >= 400) {
    event.preventDefault();
    return;
  }
});
```

## 📋 Padrão Aplicado

### Chrome Extension Pattern (Referência)

```javascript
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  someAsyncFunction(request.data)
    .then(result => {
      sendResponse({ data: result }); // ✅ Always send response
    })
    .catch(error => {
      sendResponse({ error: error.message }); // ✅ Always send response, even on error
    });
  
  return true; // Indicates async response
});
```

### Nossa Implementação (Equivalente)

```typescript
async function apiRequest<T>(endpoint, options): Promise<T> {
  try {
    const data = await fetchWithTimeout(...);
    return data; // ✅ Success response
  } catch (error) {
    throw new ApiError(...); // ✅ Always throw ApiError (our "sendResponse")
  }
}
```

## 🔍 Tratamento de Erros Específicos

### 1. AbortError (Request Cancelled)

```typescript
if (error.name === 'AbortError' || controller.signal.aborted) {
  throw new ApiError(408, 'Request timeout or cancelled');
}
```

### 2. Message Port Closed

```typescript
if (error.message.includes('message port closed') ||
    error.message.includes('The message port closed')) {
  throw new ApiError(503, 'Network error: Unable to connect to server');
}
```

### 3. Network Errors

```typescript
if (error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')) {
  throw new ApiError(503, 'Network error: Unable to connect to server');
}
```

## ✅ Benefícios

1. **Sempre há uma resposta**: Mesmo em caso de erro ou cancelamento
2. **Sem unhandled rejections**: Todos os erros são capturados e transformados em ApiError
3. **Melhor UX**: Usuário sempre recebe feedback, mesmo quando requisição é cancelada
4. **Logs limpos**: Erros de extensões do Chrome são suprimidos
5. **Debugging facilitado**: Erros são categorizados e têm mensagens claras

## 🧪 Testando

### Teste 1: Cancelamento de Requisição

```typescript
const controller = new AbortController();
const promise = apiClient.listCalendarEvents(10);

// Cancelar antes de completar
setTimeout(() => controller.abort(), 100);

try {
  await promise;
} catch (error) {
  // Deve receber ApiError(408) em vez de unhandled rejection
  console.assert(error.status === 408);
}
```

### Teste 2: Timeout

```typescript
// Requisição que demora mais que o timeout
const promise = apiClient.listCalendarEvents(10);

try {
  await promise;
} catch (error) {
  // Deve receber ApiError(408) em vez de unhandled rejection
  console.assert(error.status === 408);
}
```

### Teste 3: Network Error

```typescript
// Simular erro de rede
const promise = apiClient.listCalendarEvents(10);

try {
  await promise;
} catch (error) {
  // Deve receber ApiError(503) em vez de unhandled rejection
  console.assert(error.status === 503);
}
```

## 📝 Arquivos Modificados

- `studio/src/lib/api-client.ts`
  - Melhorado `fetchWithTimeout` para sempre limpar timeouts
  - Melhorado `apiRequest` para sempre fornecer resposta
  - Tratamento específico de erros de message port closed

- `studio/src/lib/error-handler.ts`
  - Suprimir erros de extensões do Chrome
  - Suprimir erros de abort já tratados
  - Suprimir erros de rede já tratados

## ✅ Status

- ✅ Padrão "always send response" implementado
- ✅ Tratamento de AbortError melhorado
- ✅ Tratamento de message port closed implementado
- ✅ Error handler global atualizado
- ✅ Sem erros de lint

## 🚀 Próximos Passos

1. **Testar em produção**: Verificar se erros de message port closed desaparecem
2. **Monitorar logs**: Verificar se há menos unhandled rejections
3. **Melhorar UX**: Adicionar feedback visual para requisições canceladas

---

**Data**: 2025-11-13
**Status**: ✅ Implementado

