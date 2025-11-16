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
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if (message.includes('Invalid or expired authentication') ||
        message.includes('authentication') && reason?.status === 401 ||
        message.includes('ApiError') && reason?.status === 401 ||
        message.includes('401') && (message.includes('Unauthorized') || message.includes('calendar/events'))) {
      event.preventDefault();
      return;
    }
  });
  
  // Suppress Chrome extension runtime errors and Firestore connection errors
  var originalError = console.error;
  console.error = function() {
    // Check all arguments (not just first one)
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    // Suppress Firestore connection/network errors (handled by SDK retry logic)
    if (allText.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        allText.includes('QUIC_PUBLIC_RESET') ||
        allText.includes('firestore.googleapis.com') && (
          allText.includes('Listen/channel') ||
          allText.includes('Bad Request') ||
          allText.includes('net::')
        ) ||
        allText.includes('WebChannelConnection') ||
        allText.includes('Firestore') && allText.includes('transport errored')) {
      return; // Suppress silently - transient network errors handled by Firestore SDK
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    // This includes network errors, API errors, and fetch failures
    if (allText.includes('Invalid or expired authentication') ||
        allText.includes('authentication') && allText.includes('401') ||
        allText.includes('ApiError') && allText.includes('401') ||
        allText.includes('Failed to load events') && allText.includes('401') ||
        (allText.includes('401') && allText.includes('Unauthorized')) ||
        (allText.includes('401') && allText.includes('calendar/events')) ||
        (allText.includes('GET') && allText.includes('401') && allText.includes('goflow')) ||
        (allText.includes('401') && allText.includes('goflow--magnetai-4h4a8')) ||
        (allText.includes('Unauthorized') && allText.includes('goflow'))) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    // Check if any argument contains runtime error patterns
    var hasRuntimeError = allArgs.some(function(arg) {
      if (typeof arg === 'string') {
        return arg.includes('runtime.lastError') || 
               arg.includes('message port closed') ||
               arg.includes('Unchecked runtime') ||
               arg.includes('The message port closed') ||
               arg.includes('message port closed before a response') ||
               arg.includes('ChromePolyfill') ||
               arg.includes('inject.bundle.js') ||
               arg.includes('Cross-Origin-Opener-Policy');
      }
      return false;
    });
    
    // Check combined text for patterns (more comprehensive)
    if (allText.includes('runtime.lastError') || 
        allText.includes('message port closed') ||
        allText.includes('Unchecked runtime') ||
        allText.includes('The message port closed') ||
        allText.includes('message port closed before a response') ||
        allText.includes('ChromePolyfill') ||
        allText.includes('inject.bundle.js') ||
        allText.includes('Cross-Origin-Opener-Policy') ||
        allText.includes('would block the window.close call') ||
        hasRuntimeError) {
      return; // Suppress silently - Chrome extension communication errors
    }
    
    // Not a runtime error, log normally
    originalError.apply(console, arguments);
  };
  
  // Suppress COOP warnings, runtime errors, and Firestore connection errors in console.warn
  var originalWarn = console.warn;
  console.warn = function() {
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    // Suppress Firestore connection errors (automatically handled by SDK)
    if (allText.includes('WebChannelConnection') ||
        allText.includes('transport errored') ||
        allText.includes('Firestore') && (
          allText.includes('stream') || 
          allText.includes('Listen') ||
          allText.includes('connection')
        )) {
      return; // Suppress silently - Firestore SDK handles reconnection
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if (allText.includes('401') && (allText.includes('Unauthorized') || allText.includes('calendar/events'))) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    if (allText.includes('Cross-Origin-Opener-Policy') ||
        allText.includes('would block the window.close call') ||
        allText.includes('runtime.lastError') ||
        allText.includes('message port closed') ||
        allText.includes('message port closed before a response') ||
        allText.includes('Unchecked runtime') ||
        allText.includes('ChromePolyfill')) {
      return; // Suppress silently - Chrome extension communication errors
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
    
    // Suppress Chrome extension messages (info messages, not errors)
    if (allText.includes('[ChromePolyfill]') ||
        allText.includes('Chrome API support enabled') ||
        allText.includes('ChromePolyfill')) {
      return; // Suppress Chrome extension info messages
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if ((allText.includes('401') && allText.includes('Unauthorized')) ||
        (allText.includes('401') && allText.includes('calendar/events')) ||
        (allText.includes('GET') && allText.includes('401') && allText.includes('goflow')) ||
        (allText.includes('Unauthorized') && allText.includes('goflow'))) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    if (allText.includes('runtime.lastError') ||
        allText.includes('message port closed') ||
        allText.includes('message port closed before a response') ||
        allText.includes('Unchecked runtime')) {
      return; // Suppress silently - Chrome extension communication errors
    }
    originalLog.apply(console, arguments);
  };
  
  // Intercept window.onerror
  var originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    var messageStr = message?.toString() || '';
    if (messageStr.includes('runtime.lastError') || 
        messageStr.includes('message port closed') ||
        messageStr.includes('message port closed before a response') ||
        messageStr.includes('Unchecked runtime.lastError') ||
        messageStr.includes('ChromePolyfill') ||
        messageStr.includes('inject.bundle.js') ||
        messageStr.includes('Cross-Origin-Opener-Policy') ||
        messageStr.includes('would block the window.close call')) {
      return true; // Suppress Chrome extension errors
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

