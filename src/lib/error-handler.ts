'use client';

/**
 * Global Error Handler for Unhandled Promise Rejections
 * Prevents "Uncaught (in promise)" errors from appearing in console
 */

// Type declaration for Chrome extension API
declare const chrome: {
  runtime?: {
    sendMessage?: (...args: any[]) => any;
    connect?: (...args: any[]) => any;
    lastError?: { message?: string };
  };
} | undefined;

if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    
    // Suppress Chrome extension errors
    if (message.includes('message port closed') || 
        message.includes('runtime.lastError') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('Extension context invalidated') ||
        message.includes('The message port closed') ||
        (reason?.name === 'ChromeExtensionError')) {
      event.preventDefault();
      return;
    }

    // Suppress abort/cancellation errors (handled by api-client)
    if (message.includes('Request was cancelled') ||
        message.includes('Request timeout') ||
        message.includes('timeout') ||
        message.includes('AbortError') ||
        (reason?.name === 'AbortError')) {
      event.preventDefault();
      return;
    }

    // Suppress timeout errors from getRedirectResult (handled in AuthContext)
    if (message.includes('timeout') && 
        (message.includes('getRedirectResult') || message.includes('Firebase'))) {
      event.preventDefault();
      return;
    }

    // Suppress network errors that are handled gracefully
    if (message.includes('Network error') ||
        message.includes('Failed to fetch') ||
        message.includes('Network request failed')) {
      // Only suppress if it's a handled error (has status code)
      if (reason?.status && reason.status >= 400) {
        event.preventDefault();
        return;
      }
    }

    // Log other unhandled rejections in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unhandled promise rejection:', event.reason);
    } else {
      // In production, prevent default to avoid console errors
      event.preventDefault();
    }
  });

  // Suppress Chrome extension runtime errors and COOP warnings
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Check for chrome.runtime.lastError pattern
    const hasLastError = args.some(arg => 
      arg && typeof arg === 'object' && 
      ('lastError' in arg || 'runtime' in arg)
    );
    
    // Check all arguments for runtime.lastError patterns
    const hasRuntimeError = args.some(arg => {
      if (typeof arg === 'string') {
        return arg.includes('runtime.lastError') || 
               arg.includes('message port closed') ||
               arg.includes('Unchecked runtime.lastError') ||
               arg.includes('The message port closed');
      }
      return false;
    });
    
    // Check for Cross-Origin-Opener-Policy warnings (Firebase Auth popup cleanup)
    const hasCOOPWarning = message.includes('Cross-Origin-Opener-Policy') ||
                           message.includes('would block the window.close call') ||
                           args.some(arg => 
                             typeof arg === 'string' && 
                             arg.includes('Cross-Origin-Opener-Policy')
                           );
    
    if (message.includes('runtime.lastError') || 
        message.includes('message port closed') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('The message port closed') ||
        hasLastError ||
        hasRuntimeError ||
        hasCOOPWarning) {
      // Suppress Chrome extension errors and COOP warnings silently
      return;
    }
    originalError.apply(console, args);
  };

  // Handle chrome.runtime.lastError if chrome.runtime exists (for Chrome extensions)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Wrap chrome.runtime methods to check lastError
    const originalSendMessage = chrome.runtime.sendMessage;
    if (originalSendMessage) {
      chrome.runtime.sendMessage = function(...args: any[]) {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          const wrappedCallback = function(response: any) {
            if (chrome?.runtime?.lastError) {
              // Silently handle the error - port was closed or extension context invalidated
              // This is normal when extensions reload or pages navigate
              return; // Important to return if an error occurred
            }
            // Process the successful response
            callback(response);
          };
          args[args.length - 1] = wrappedCallback;
        }
        return originalSendMessage.apply(chrome.runtime!, args);
      };
    }
    
    // Also wrap connect to prevent port closure errors
    const originalConnect = chrome.runtime.connect;
    if (originalConnect) {
      chrome.runtime.connect = function(...args: any[]) {
        try {
          const port = originalConnect.apply(chrome.runtime, args);
          if (port && port.onDisconnect && typeof port.onDisconnect.addListener === 'function') {
            const originalOnDisconnect = port.onDisconnect.addListener;
            port.onDisconnect.addListener = function(callback: any) {
              if (typeof originalOnDisconnect === 'function') {
                return originalOnDisconnect.call(port.onDisconnect, function() {
                  // Silently handle disconnect - this is normal
                  if (chrome?.runtime?.lastError) {
                    return;
                  }
                  if (callback) callback();
                });
              }
            };
          }
          return port;
        } catch (e) {
          // Silently handle connection errors
          return null as any;
        }
      };
    }
  }
  
  // Also intercept window.onerror to catch runtime.lastError and COOP warnings
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const messageStr = message?.toString() || '';
    if (messageStr.includes('runtime.lastError') || 
        messageStr.includes('message port closed') ||
        messageStr.includes('Unchecked runtime.lastError') ||
        messageStr.includes('Cross-Origin-Opener-Policy') ||
        messageStr.includes('would block the window.close call')) {
      // Suppress Chrome extension errors and COOP warnings
      return true; // Prevent default error handling
    }
    if (originalOnError && typeof originalOnError === 'function') {
      try {
        return originalOnError.call(window, message, source, lineno, colno, error);
      } catch (e) {
        // Silently handle errors in error handler
        return false;
      }
    }
    return false;
  };
  
  // Also suppress COOP warnings from console.warn
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Cross-Origin-Opener-Policy') ||
        message.includes('would block the window.close call')) {
      // Suppress COOP warnings from Firebase Auth popup cleanup
      return;
    }
    originalWarn.apply(console, args);
  };
}

// Export empty object to satisfy TypeScript module requirements
// This is a side-effect module that initializes error handlers
export {};

