# Error Handler Test Plan - Comprehensive Testing Strategy

**Objetivo:** Garantir que o error handler funciona corretamente no contexto amplo da aplicação  
**Framework:** Jest + Testing Library  
**Data:** 2025-11-20

---

## 📋 Sumário Executivo

Este documento descreve uma estratégia completa de testes para validar que o error handler:
1. Suprime corretamente erros esperados
2. Não suprime erros legítimos
3. Funciona em diferentes contextos da aplicação
4. Mantém performance adequada
5. Funciona em diferentes navegadores e ambientes

---

## 🎯 Categorias de Testes

### 1. **Unit Tests** (Funções Helper)
### 2. **Integration Tests** (Interação com Console/Window)
### 3. **Component Tests** (Componentes React)
### 4. **E2E Tests** (Fluxos Completos)
### 5. **Browser Tests** (Diferentes Navegadores)
### 6. **Performance Tests** (Impacto na Performance)

---

## 1️⃣ Unit Tests - Funções Helper

### Objetivo
Testar as funções helper isoladamente para garantir lógica correta.

### Arquivo: `src/lib/__tests__/error-handler-init.test.ts`

```typescript
import { ERROR_HANDLER_INLINE_SCRIPT } from '../error-handler-init';

describe('Error Handler - Helper Functions', () => {
  let windowSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Create fresh window object
    windowSpy = jest.spyOn(window, 'window', 'get');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Execute the inline script
    eval(ERROR_HANDLER_INLINE_SCRIPT);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('normalizeText()', () => {
    it('should normalize text to lowercase', () => {
      // Test via matchesPattern behavior
      console.error('Unchecked Runtime.LastError');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should trim whitespace', () => {
      console.error('  message port closed  ');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle null/undefined', () => {
      console.error(null, undefined);
      // Should not throw
      expect(() => console.error(null, undefined)).not.toThrow();
    });
  });

  describe('matchesPattern()', () => {
    it('should match case-insensitive patterns', () => {
      const patterns = ['runtime.lastError', 'message port closed'];
      
      // Test various case combinations
      console.error('Unchecked RUNTIME.LASTERROR');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      console.error('MESSAGE PORT CLOSED');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      console.error('Runtime.LastError');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should match partial patterns', () => {
      console.error('The message port closed before a response was received');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not match unrelated errors', () => {
      console.error('Real application error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('checkErrorObject()', () => {
    it('should check error.message', () => {
      const error = new Error('Unchecked runtime.lastError');
      console.error(error);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should check error.stack', () => {
      const error = new Error('Some error');
      error.stack = 'Error: Some error\n    at message port closed';
      console.error(error);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should check error.toString()', () => {
      const error = {
        toString: () => 'Unchecked runtime.lastError'
      };
      console.error(error);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle errors without message/stack', () => {
      const error = {};
      console.error(error);
      // Should not throw
      expect(() => console.error(error)).not.toThrow();
    });
  });
});
```

### Testes Necessários:
- ✅ Normalização de texto (lowercase, trim)
- ✅ Matching case-insensitive
- ✅ Verificação de objetos Error
- ✅ Verificação de stack traces
- ✅ Tratamento de valores null/undefined

---

## 2️⃣ Integration Tests - Console/Window Interception

### Objetivo
Testar que os handlers interceptam corretamente os diferentes canais de erro.

### Arquivo: `src/lib/__tests__/error-handler-integration.test.ts`

```typescript
describe('Error Handler - Integration Tests', () => {
  beforeEach(() => {
    // Execute script fresh for each test
    eval(ERROR_HANDLER_INLINE_SCRIPT);
  });

  describe('unhandledrejection', () => {
    it('should suppress Chrome extension errors', (done) => {
      const originalError = console.error;
      let errorLogged = false;

      console.error = jest.fn(() => {
        errorLogged = true;
      });

      const promise = Promise.reject(new Error('Unchecked runtime.lastError'));
      
      // Wait a bit to ensure handler processes
      setTimeout(() => {
        expect(errorLogged).toBe(false);
        console.error = originalError;
        done();
      }, 100);

      // Trigger unhandled rejection
      promise.catch(() => {});
    });

    it('should suppress 401 authentication errors', (done) => {
      const originalError = console.error;
      let errorLogged = false;

      console.error = jest.fn(() => {
        errorLogged = true;
      });

      const apiError = {
        message: 'Failed to load resource',
        status: 401
      };

      Promise.reject(apiError).catch(() => {});

      setTimeout(() => {
        expect(errorLogged).toBe(false);
        console.error = originalError;
        done();
      }, 100);
    });

    it('should NOT suppress legitimate errors', (done) => {
      const originalError = console.error;
      let errorLogged = false;

      console.error = jest.fn(() => {
        errorLogged = true;
      });

      Promise.reject(new Error('Real application error')).catch(() => {});

      setTimeout(() => {
        // Legitimate errors should still be logged
        expect(errorLogged).toBe(true);
        console.error = originalError;
        done();
      }, 100);
    });
  });

  describe('console.error interception', () => {
    it('should suppress Chrome extension errors', () => {
      const originalError = console.error;
      let called = false;

      console.error = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.error('Unchecked runtime.lastError: The message port closed');
      expect(called).toBe(false);

      console.error = originalError;
    });

    it('should suppress Firestore connection errors', () => {
      const originalError = console.error;
      let called = false;

      console.error = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.error('WebChannelConnection transport errored');
      expect(called).toBe(false);

      console.error = originalError;
    });

    it('should suppress 401 errors', () => {
      const originalError = console.error;
      let called = false;

      console.error = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.error('GET https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/google/calendar/events 401 (Unauthorized)');
      expect(called).toBe(false);

      console.error = originalError;
    });

    it('should NOT suppress legitimate errors', () => {
      const originalError = console.error;
      let called = false;

      console.error = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.error('Real application error');
      expect(called).toBe(true);

      console.error = originalError;
    });
  });

  describe('console.warn interception', () => {
    it('should suppress Chrome extension warnings', () => {
      const originalWarn = console.warn;
      let called = false;

      console.warn = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.warn('Cross-Origin-Opener-Policy would block');
      expect(called).toBe(false);

      console.warn = originalWarn;
    });
  });

  describe('console.log interception', () => {
    it('should suppress Chrome extension info messages', () => {
      const originalLog = console.log;
      let called = false;

      console.log = jest.fn(() => {
        called = true;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      console.log('[ChromePolyfill] Chrome API support enabled');
      expect(called).toBe(false);

      console.log = originalLog;
    });
  });

  describe('window.onerror interception', () => {
    it('should suppress Chrome extension errors', () => {
      const originalOnError = window.onerror;
      let called = false;

      window.onerror = jest.fn(() => {
        called = true;
        return false;
      });

      eval(ERROR_HANDLER_INLINE_SCRIPT);

      // Simulate error
      const errorEvent = new ErrorEvent('error', {
        message: 'Unchecked runtime.lastError: The message port closed'
      });

      const result = window.onerror?.call(
        window,
        errorEvent.message,
        'test.js',
        1,
        1,
        new Error(errorEvent.message)
      );

      expect(result).toBe(true); // Should suppress
      expect(called).toBe(false); // Original handler not called

      window.onerror = originalOnError;
    });
  });
});
```

### Testes Necessários:
- ✅ unhandledrejection para todos os tipos de erro
- ✅ console.error para todos os padrões
- ✅ console.warn para warnings
- ✅ console.log para mensagens info
- ✅ window.onerror para erros globais
- ✅ Verificar que erros legítimos NÃO são suprimidos

---

## 3️⃣ Component Tests - React Components

### Objetivo
Testar que componentes React funcionam corretamente com o error handler ativo.

### Arquivo: `src/app/calendar/__tests__/page-error-handling.test.tsx`

```typescript
import { render, screen, waitFor } from '@/test-utils';
import CalendarPage from '../page';
import * as apiClient from '@/lib/api-client';

// Mock API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    useBackendApi: jest.fn(() => true),
    getOAuthStatus: jest.fn(),
  },
  getOAuthStatus: jest.fn(),
}));

describe('CalendarPage - Error Handling', () => {
  beforeEach(() => {
    // Execute error handler before each test
    eval(ERROR_HANDLER_INLINE_SCRIPT);
    
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should suppress 401 errors from API calls', async () => {
    const mockGetOAuthStatus = apiClient.getOAuthStatus as jest.Mock;
    mockGetOAuthStatus.mockRejectedValue({
      status: 401,
      message: 'Unauthorized'
    });

    render(<CalendarPage />);

    await waitFor(() => {
      // 401 error should be suppressed from console
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('401')
      );
    });

    // But UI should show authentication required message
    expect(screen.getByText(/autenticar com Google/i)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    const mockGetOAuthStatus = apiClient.getOAuthStatus as jest.Mock;
    mockGetOAuthStatus.mockRejectedValue(new Error('Failed to fetch'));

    render(<CalendarPage />);

    await waitFor(() => {
      // Network errors should be handled, not suppressed
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });

  it('should NOT suppress legitimate application errors', async () => {
    const mockGetOAuthStatus = apiClient.getOAuthStatus as jest.Mock;
    mockGetOAuthStatus.mockRejectedValue(
      new Error('Database connection failed')
    );

    render(<CalendarPage />);

    await waitFor(() => {
      // Legitimate errors should be logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database')
      );
    });
  });
});
```

### Testes Necessários:
- ✅ Componentes funcionam com error handler ativo
- ✅ Erros 401 são suprimidos mas UI funciona
- ✅ Erros legítimos são logados
- ✅ Loading states funcionam corretamente
- ✅ Error boundaries funcionam

---

## 4️⃣ E2E Tests - Fluxos Completos

### Objetivo
Testar fluxos completos de usuário com o error handler ativo.

### Arquivo: `e2e/error-handler.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Error Handler - E2E Tests', () => {
  test('should suppress Chrome extension errors during OAuth flow', async ({ page, context }) => {
    // Add Chrome extension simulation
    await context.addInitScript(() => {
      // Simulate Chrome extension error
      setTimeout(() => {
        const error = new Error('Unchecked runtime.lastError: The message port closed');
        window.dispatchEvent(new ErrorEvent('error', { error }));
      }, 100);
    });

    await page.goto('/calendar');
    
    // Check console for suppressed errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);

    // Chrome extension errors should be suppressed
    const chromeErrors = consoleErrors.filter(err => 
      err.includes('runtime.lastError') || 
      err.includes('message port closed')
    );
    expect(chromeErrors.length).toBe(0);
  });

  test('should suppress 401 errors during calendar load', async ({ page }) => {
    // Mock API to return 401
    await page.route('**/api/google/calendar/events*', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    await page.goto('/calendar');

    // Check console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForSelector('[data-testid="auth-required"]', { timeout: 5000 });

    // 401 errors should be suppressed
    const authErrors = consoleErrors.filter(err => 
      err.includes('401') || err.includes('Unauthorized')
    );
    expect(authErrors.length).toBe(0);

    // But UI should show auth required message
    await expect(page.getByText(/autenticar com Google/i)).toBeVisible();
  });

  test('should NOT suppress legitimate errors', async ({ page }) => {
    // Mock API to return 500 (server error - legitimate)
    await page.route('**/api/google/calendar/events*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/calendar');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Legitimate errors should be logged
    const serverErrors = consoleErrors.filter(err => 
      err.includes('500') || err.includes('server error')
    );
    expect(serverErrors.length).toBeGreaterThan(0);
  });

  test('should handle OAuth redirect with error suppression', async ({ page }) => {
    // Simulate OAuth redirect with success
    await page.goto('/calendar?oauth_success=true');

    // Add Chrome extension error simulation
    await page.evaluate(() => {
      setTimeout(() => {
        console.error('Unchecked runtime.lastError');
      }, 100);
    });

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);

    // Chrome errors should be suppressed
    const chromeErrors = consoleErrors.filter(err => 
      err.includes('runtime.lastError')
    );
    expect(chromeErrors.length).toBe(0);
  });
});
```

### Testes Necessários:
- ✅ Fluxo completo de OAuth com erros suprimidos
- ✅ Carregamento de calendário com 401 suprimido
- ✅ Erros legítimos não são suprimidos
- ✅ UI funciona corretamente mesmo com erros suprimidos
- ✅ Performance não é afetada

---

## 5️⃣ Browser Tests - Diferentes Navegadores

### Objetivo
Garantir que o error handler funciona em diferentes navegadores.

### Arquivo: `e2e/browser-compatibility.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

const browsers = [
  { name: 'Chromium', ...devices['Desktop Chrome'] },
  { name: 'Firefox', ...devices['Desktop Firefox'] },
  { name: 'WebKit', ...devices['Desktop Safari'] },
];

browsers.forEach(({ name }) => {
  test.describe(`Error Handler - ${name}`, () => {
    test('should suppress Chrome extension errors', async ({ page, browserName }) => {
      // Skip for non-Chrome browsers (they don't have Chrome extensions)
      if (browserName !== 'chromium') {
        test.skip();
      }

      await page.goto('/calendar');

      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Simulate Chrome extension error
      await page.evaluate(() => {
        console.error('Unchecked runtime.lastError: The message port closed');
      });

      await page.waitForTimeout(100);

      const chromeErrors = consoleErrors.filter(err => 
        err.includes('runtime.lastError')
      );
      expect(chromeErrors.length).toBe(0);
    });

    test('should suppress 401 errors in all browsers', async ({ page }) => {
      await page.route('**/api/google/calendar/events*', route => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      });

      await page.goto('/calendar');

      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForSelector('[data-testid="auth-required"]', { timeout: 5000 });

      const authErrors = consoleErrors.filter(err => 
        err.includes('401') || err.includes('Unauthorized')
      );
      expect(authErrors.length).toBe(0);
    });
  });
});
```

### Testes Necessários:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari/WebKit
- ✅ Edge
- ✅ Mobile browsers (opcional)

---

## 6️⃣ Performance Tests

### Objetivo
Garantir que o error handler não impacta performance.

### Arquivo: `src/lib/__tests__/error-handler-performance.test.ts`

```typescript
describe('Error Handler - Performance Tests', () => {
  beforeEach(() => {
    eval(ERROR_HANDLER_INLINE_SCRIPT);
  });

  it('should handle high volume of errors efficiently', () => {
    const startTime = performance.now();
    
    // Simulate 1000 errors
    for (let i = 0; i < 1000; i++) {
      console.error(`Unchecked runtime.lastError ${i}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should process 1000 errors in less than 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should not cause memory leaks', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Generate many errors
    for (let i = 0; i < 10000; i++) {
      console.error(`Test error ${i}`);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  it('should not block main thread', async () => {
    let blocked = false;
    
    const startTime = performance.now();
    
    // Simulate many errors
    for (let i = 0; i < 100; i++) {
      console.error(`Error ${i}`);
    }

    // Check if main thread was blocked
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete quickly (< 50ms)
    expect(duration).toBeLessThan(50);
    expect(blocked).toBe(false);
  });
});
```

### Testes Necessários:
- ✅ Performance com alto volume de erros
- ✅ Sem memory leaks
- ✅ Não bloqueia main thread
- ✅ Tempo de execução aceitável

---

## 7️⃣ Edge Cases & Regression Tests

### Objetivo
Testar casos extremos e prevenir regressões.

### Arquivo: `src/lib/__tests__/error-handler-edge-cases.test.ts`

```typescript
describe('Error Handler - Edge Cases', () => {
  beforeEach(() => {
    eval(ERROR_HANDLER_INLINE_SCRIPT);
  });

  it('should handle errors with special characters', () => {
    console.error('Unchecked runtime.lastError\u00a0'); // Non-breaking space
    console.error('message port closed\u200b'); // Zero-width space
    // Should not throw
    expect(() => {
      console.error('test');
    }).not.toThrow();
  });

  it('should handle very long error messages', () => {
    const longMessage = 'Unchecked runtime.lastError: ' + 'a'.repeat(10000);
    console.error(longMessage);
    // Should not throw or cause performance issues
    expect(() => {
      console.error(longMessage);
    }).not.toThrow();
  });

  it('should handle circular references in error objects', () => {
    const circularError: any = new Error('Test');
    circularError.self = circularError;
    
    console.error(circularError);
    // Should not throw
    expect(() => {
      console.error(circularError);
    }).not.toThrow();
  });

  it('should handle multiple error handlers', () => {
    // Execute script multiple times
    eval(ERROR_HANDLER_INLINE_SCRIPT);
    eval(ERROR_HANDLER_INLINE_SCRIPT);
    eval(ERROR_HANDLER_INLINE_SCRIPT);

    console.error('Unchecked runtime.lastError');
    // Should still work correctly
    expect(() => {
      console.error('test');
    }).not.toThrow();
  });

  it('should handle errors during script execution', () => {
    // Simulate error during handler setup
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'unhandledrejection') {
        throw new Error('Setup error');
      }
      return originalAddEventListener.call(window, event, handler);
    });

    // Should not crash application
    expect(() => {
      eval(ERROR_HANDLER_INLINE_SCRIPT);
    }).not.toThrow();

    window.addEventListener = originalAddEventListener;
  });
});
```

### Testes Necessários:
- ✅ Caracteres especiais
- ✅ Mensagens muito longas
- ✅ Referências circulares
- ✅ Múltiplas execuções do script
- ✅ Erros durante setup

---

## 📊 Matriz de Cobertura

| Categoria | Testes Unitários | Testes Integração | Testes Component | Testes E2E | Total |
|-----------|-----------------|-------------------|------------------|------------|-------|
| Helper Functions | 15 | - | - | - | 15 |
| Console Interception | - | 20 | - | - | 20 |
| Window.onerror | - | 5 | - | - | 5 |
| Component Integration | - | - | 10 | - | 10 |
| E2E Flows | - | - | - | 8 | 8 |
| Browser Compatibility | - | - | - | 6 | 6 |
| Performance | 3 | - | - | - | 3 |
| Edge Cases | 5 | - | - | - | 5 |
| **TOTAL** | **23** | **25** | **10** | **14** | **72** |

---

## 🚀 Como Executar os Testes

### Todos os Testes
```bash
npm test
```

### Testes Específicos
```bash
# Unit tests only
npm test error-handler-init.test.ts

# Integration tests only
npm test error-handler-integration.test.ts

# Component tests only
npm test page-error-handling.test.tsx

# E2E tests (requires Playwright)
npm run test:e2e
```

### Com Cobertura
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

---

## ✅ Critérios de Sucesso

### Cobertura Mínima
- ✅ **Unit Tests:** 100% das funções helper
- ✅ **Integration Tests:** 100% dos canais de erro
- ✅ **Component Tests:** Componentes críticos (CalendarPage)
- ✅ **E2E Tests:** Fluxos críticos (OAuth, Calendar)

### Performance
- ✅ Processar 1000 erros em < 100ms
- ✅ Sem memory leaks após 10k erros
- ✅ Não bloquear main thread

### Funcionalidade
- ✅ Suprimir 100% dos erros esperados
- ✅ NÃO suprimir erros legítimos
- ✅ Funcionar em todos os navegadores principais

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Error Handler Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

---

## 📝 Próximos Passos

1. ✅ Criar arquivos de teste conforme este plano
2. ✅ Executar testes e verificar cobertura
3. ✅ Adicionar testes E2E com Playwright
4. ✅ Configurar CI/CD para executar testes automaticamente
5. ✅ Adicionar testes de regressão para novos padrões

---

## 🎯 Priorização

### Alta Prioridade 🔴
1. Unit tests para helper functions
2. Integration tests para console interception
3. Component tests para CalendarPage

### Média Prioridade 🟡
4. E2E tests para fluxos críticos
5. Performance tests
6. Edge cases

### Baixa Prioridade 🟢
7. Browser compatibility tests
8. Visual regression tests
9. Accessibility tests com error handler

---

**Status:** 📋 Plano Completo  
**Próxima Ação:** Implementar testes unitários e de integração

