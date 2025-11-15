/**
 * Error Handler Initialization Script
 * This file is designed to be loaded as an inline script BEFORE React initializes
 * to ensure error handlers are active before any providers mount
 */

// This will be injected as an inline script in the HTML head
// It initializes error handlers immediately, before React code runs
export const ERROR_HANDLER_INLINE_SCRIPT = `
(function() {
  if (typeof window === 'undefined') return;
  
  // Initialize error handlers immediately
  // This runs before React components mount, ensuring errors during
  // provider initialization are caught
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = reason?.message || reason?.toString() || '';
    
    // Suppress Chrome extension errors
    if (message.includes('message port closed') || 
        message.includes('runtime.lastError') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('Extension context invalidated') ||
        message.includes('The message port closed')) {
      event.preventDefault();
      return;
    }
    
    // Suppress abort/cancellation errors
    if (message.includes('Request was cancelled') ||
        message.includes('Request timeout') ||
        message.includes('timeout') ||
        message.includes('AbortError')) {
      event.preventDefault();
      return;
    }
    
    // Suppress timeout errors from Firebase
    if (message.includes('timeout') && 
        (message.includes('getRedirectResult') || message.includes('Firebase'))) {
      event.preventDefault();
      return;
    }
    
    // Suppress network errors that are handled gracefully
    if (message.includes('Network error') ||
        message.includes('Failed to fetch') ||
        message.includes('Network request failed')) {
      if (reason?.status && reason.status >= 400) {
        event.preventDefault();
        return;
      }
    }
  });
  
  // Suppress Chrome extension runtime errors
  var originalError = console.error;
  console.error = function() {
    // Check all arguments (not just first one)
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    // Check if any argument contains runtime error patterns
    var hasRuntimeError = allArgs.some(function(arg) {
      if (typeof arg === 'string') {
        return arg.includes('runtime.lastError') || 
               arg.includes('message port closed') ||
               arg.includes('Unchecked runtime') ||
               arg.includes('The message port closed') ||
               arg.includes('Cross-Origin-Opener-Policy');
      }
      return false;
    });
    
    // Check combined text for patterns
    if (allText.includes('runtime.lastError') || 
        allText.includes('message port closed') ||
        allText.includes('Unchecked runtime') ||
        allText.includes('The message port closed') ||
        allText.includes('Cross-Origin-Opener-Policy') ||
        allText.includes('would block the window.close call') ||
        hasRuntimeError) {
      return; // Suppress silently
    }
    
    // Not a runtime error, log normally
    originalError.apply(console, arguments);
  };
  
  // Suppress COOP warnings and runtime errors in console.warn
  var originalWarn = console.warn;
  console.warn = function() {
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    if (allText.includes('Cross-Origin-Opener-Policy') ||
        allText.includes('would block the window.close call') ||
        allText.includes('runtime.lastError') ||
        allText.includes('message port closed') ||
        allText.includes('Unchecked runtime')) {
      return; // Suppress silently
    }
    originalWarn.apply(console, arguments);
  };
  
  // Also suppress in console.log (some extensions log there)
  var originalLog = console.log;
  console.log = function() {
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    if (allText.includes('runtime.lastError') ||
        allText.includes('message port closed') ||
        allText.includes('Unchecked runtime')) {
      return; // Suppress silently
    }
    originalLog.apply(console, arguments);
  };
  
  // Intercept window.onerror
  var originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    var messageStr = message?.toString() || '';
    if (messageStr.includes('runtime.lastError') || 
        messageStr.includes('message port closed') ||
        messageStr.includes('Unchecked runtime.lastError') ||
        messageStr.includes('Cross-Origin-Opener-Policy') ||
        messageStr.includes('would block the window.close call')) {
      return true;
    }
    if (originalOnError && typeof originalOnError === 'function') {
      try {
        return originalOnError.call(window, message, source, lineno, colno, error);
      } catch (e) {
        return false;
      }
    }
    return false;
  };
})();
`.trim();

