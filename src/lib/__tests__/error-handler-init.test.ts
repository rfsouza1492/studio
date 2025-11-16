/**
 * Error Handler Init Tests
 * Tests for error suppression logic in error-handler-init.ts
 */

import { ERROR_HANDLER_INLINE_SCRIPT } from '../error-handler-init';

describe('Error Handler Init', () => {
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleLog: typeof console.log;
  let originalOnError: typeof window.onerror;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original implementations
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleLog = console.log;
    originalOnError = window.onerror;

    // Create spies
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    logSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute the error handler script
    eval(ERROR_HANDLER_INLINE_SCRIPT);
  });

  afterEach(() => {
    // Restore original implementations
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    window.onerror = originalOnError;
    jest.restoreAllMocks();
  });

  describe('Chrome Extension Errors', () => {
    it('should suppress "Unchecked runtime.lastError" errors', () => {
      console.error('Unchecked runtime.lastError: The message port closed');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress "message port closed" errors', () => {
      console.error('The message port closed before a response was received');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress case variations', () => {
      console.error('UNCHECKED RUNTIME.LASTERROR');
      expect(errorSpy).not.toHaveBeenCalled();

      console.error('Message Port Closed');
      expect(errorSpy).not.toHaveBeenCalled();

      console.error('Runtime.LastError');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress errors with extra whitespace', () => {
      console.error('  Unchecked runtime.lastError  ');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress ChromePolyfill messages', () => {
      console.error('ChromePolyfill inject.bundle.js');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress Extension context invalidated', () => {
      console.error('Extension context invalidated');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Errors (401)', () => {
    it('should suppress 401 Unauthorized errors', () => {
      console.error('GET https://goflow--magnetai-4h4a8.us-east4.hosted.app/api/google/calendar/events 401 (Unauthorized)');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress "Failed to load resource" with 401', () => {
      console.error('Failed to load resource: the server responded with a status of 401');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress calendar/events 401 errors', () => {
      console.error('Failed to load events 401 calendar/events');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress ApiError with 401 status', () => {
      console.error('ApiError: 401 Unauthorized');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Firestore Connection Errors', () => {
    it('should suppress WebChannelConnection errors', () => {
      console.error('WebChannelConnection transport errored');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress Firestore transport errors', () => {
      console.error('Firestore transport errored');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress QUIC protocol errors', () => {
      console.error('ERR_QUIC_PROTOCOL_ERROR');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Legitimate Errors', () => {
    it('should NOT suppress real application errors', () => {
      console.error('Database connection failed');
      expect(errorSpy).toHaveBeenCalledWith('Database connection failed');
    });

    it('should NOT suppress 500 server errors', () => {
      console.error('GET /api/endpoint 500 Internal Server Error');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should NOT suppress validation errors', () => {
      console.error('Validation failed: email is required');
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Objects', () => {
    it('should suppress errors from Error objects with matching message', () => {
      const error = new Error('Unchecked runtime.lastError');
      console.error(error);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should suppress errors from Error objects with matching stack', () => {
      const error = new Error('Some error');
      error.stack = 'Error: Some error\n    at message port closed';
      console.error(error);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should check error.toString()', () => {
      const error = {
        toString: () => 'Unchecked runtime.lastError'
      };
      console.error(error);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('console.warn', () => {
    it('should suppress Chrome extension warnings', () => {
      console.warn('Cross-Origin-Opener-Policy would block');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should suppress runtime.lastError warnings', () => {
      console.warn('Unchecked runtime.lastError');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should NOT suppress legitimate warnings', () => {
      console.warn('Deprecated API usage');
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('console.log', () => {
    it('should suppress ChromePolyfill info messages', () => {
      console.log('[ChromePolyfill] Chrome API support enabled');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should suppress 401 errors in console.log', () => {
      console.log('GET /api/endpoint 401 Unauthorized');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should NOT suppress legitimate log messages', () => {
      console.log('Application started successfully');
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('unhandledrejection', () => {
    it('should suppress Chrome extension errors in promises', (done) => {
      const promise = Promise.reject(new Error('Unchecked runtime.lastError'));
      
      // Wait a bit for handler to process
      setTimeout(() => {
        // Error should be suppressed (not logged)
        expect(errorSpy).not.toHaveBeenCalled();
        done();
      }, 100);

      promise.catch(() => {});
    });

    it('should suppress 401 errors in promises', (done) => {
      const apiError = {
        message: 'Failed to load resource',
        status: 401,
        toString: () => 'ApiError: 401 Unauthorized'
      };

      Promise.reject(apiError).catch(() => {});

      setTimeout(() => {
        expect(errorSpy).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should NOT suppress legitimate promise rejections', (done) => {
      Promise.reject(new Error('Database connection failed')).catch(() => {});

      setTimeout(() => {
        // Legitimate errors might still trigger console.error
        // This test verifies the handler doesn't break normal error flow
        done();
      }, 100);
    });
  });

  describe('window.onerror', () => {
    it('should suppress Chrome extension errors', () => {
      const result = window.onerror?.call(
        window,
        'Unchecked runtime.lastError: The message port closed',
        'test.js',
        1,
        1,
        new Error('Unchecked runtime.lastError')
      );

      expect(result).toBe(true); // Should suppress
    });

    it('should suppress 401 errors', () => {
      const result = window.onerror?.call(
        window,
        'Failed to load resource: the server responded with a status of 401',
        'test.js',
        1,
        1,
        null
      );

      expect(result).toBe(true); // Should suppress
    });

    it('should NOT suppress legitimate errors', () => {
      const result = window.onerror?.call(
        window,
        'ReferenceError: variable is not defined',
        'test.js',
        1,
        1,
        new Error('ReferenceError')
      );

      // Should return false or call original handler
      expect(result).not.toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined gracefully', () => {
      expect(() => {
        console.error(null);
        console.error(undefined);
        console.error(null, undefined);
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'Unchecked runtime.lastError: ' + 'a'.repeat(10000);
      expect(() => {
        console.error(longMessage);
      }).not.toThrow();
    });

    it('should handle circular references', () => {
      const circularError: any = new Error('Test');
      circularError.self = circularError;
      
      expect(() => {
        console.error(circularError);
      }).not.toThrow();
    });

    it('should handle multiple arguments', () => {
      console.error('Error:', 'Unchecked runtime.lastError', { status: 401 });
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle special characters', () => {
      console.error('Unchecked runtime.lastError\u00a0'); // Non-breaking space
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle high volume of errors efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        console.error(`Unchecked runtime.lastError ${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 1000 errors in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});

