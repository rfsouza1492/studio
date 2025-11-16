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
  
  // Helper function to normalize text for comparison (case-insensitive, trimmed)
  function normalizeText(text) {
    if (!text) return '';
    return text.toString().trim().toLowerCase();
  }
  
  // Helper function to check if text matches any pattern (case-insensitive)
  function matchesPattern(text, patterns) {
    var normalized = normalizeText(text);
    return patterns.some(function(pattern) {
      return normalized.includes(normalizeText(pattern));
    });
  }
  
  // Helper function to check error object (message, stack, toString)
  function checkErrorObject(error, patterns) {
    if (!error || typeof error !== 'object') return false;
    
    // Check message
    if (error.message && matchesPattern(error.message, patterns)) return true;
    
    // Check stack trace
    if (error.stack && matchesPattern(error.stack, patterns)) return true;
    
    // Check toString
    try {
      var str = error.toString();
      if (matchesPattern(str, patterns)) return true;
    } catch (e) {
      // Ignore toString errors
    }
    
    return false;
  }
  
  // Chrome extension error patterns
  var chromeExtensionPatterns = [
    'message port closed',
    'runtime.lastError',
    'Unchecked runtime.lastError',
    'Extension context invalidated',
    'The message port closed',
    'message port closed before a response',
    'message port closed before a response was received',
    'ChromePolyfill',
    'inject.bundle.js',
    'content-script.js',
    'web-client-content-script',
    'MutationObserver',
    "Failed to execute 'observe' on 'MutationObserver'",
    "parameter 1 is not of type 'Node'",
    'observe.*MutationObserver',
    'Cross-Origin-Opener-Policy',
    'would block the window.close call'
  ];
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = reason?.message || reason?.toString() || '';
    var reasonStr = reason?.toString() || '';
    
    // Suppress Chrome extension errors (check both message and full reason string)
    if (matchesPattern(message, chromeExtensionPatterns) ||
        matchesPattern(reasonStr, chromeExtensionPatterns) ||
        checkErrorObject(reason, chromeExtensionPatterns)) {
      event.preventDefault();
      return;
    }
    
    // Abort/cancellation error patterns
    var abortPatterns = ['Request was cancelled', 'Request timeout', 'timeout', 'AbortError'];
    if (matchesPattern(message, abortPatterns) ||
        matchesPattern(reasonStr, abortPatterns)) {
      event.preventDefault();
      return;
    }
    
    // Suppress timeout errors from Firebase
    if (matchesPattern(message, ['timeout']) && 
        (matchesPattern(message, ['getRedirectResult']) || matchesPattern(message, ['Firebase']))) {
      event.preventDefault();
      return;
    }
    
    // Suppress network errors that are handled gracefully
    var networkPatterns = ['Network error', 'Failed to fetch', 'Network request failed'];
    if (matchesPattern(message, networkPatterns) ||
        matchesPattern(reasonStr, networkPatterns)) {
      if (reason?.status && reason.status >= 400) {
        event.preventDefault();
        return;
      }
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    var authPatterns = ['Invalid or expired authentication', 'authentication', 'ApiError', '401', 'Unauthorized', 'calendar/events'];
    if ((matchesPattern(message, ['Invalid or expired authentication']) ||
         (matchesPattern(message, ['authentication']) && reason?.status === 401) ||
         (matchesPattern(message, ['ApiError']) && reason?.status === 401) ||
         (matchesPattern(message, ['401']) && (matchesPattern(message, ['Unauthorized']) || matchesPattern(message, ['calendar/events']))))) {
      event.preventDefault();
      return;
    }
  });
  
  // Firestore error patterns
  var firestorePatterns = [
    'ERR_QUIC_PROTOCOL_ERROR',
    'QUIC_PUBLIC_RESET',
    'firestore.googleapis.com',
    'Listen/channel',
    'Bad Request',
    'net::',
    'WebChannelConnection',
    'Firestore',
    'transport errored',
    'stream',
    'Listen',
    'connection'
  ];
  
  // Authentication error patterns (401)
  var auth401Patterns = [
    'Invalid or expired authentication',
    'authentication',
    '401',
    'ApiError',
    'Unauthorized',
    'calendar/events',
    'Failed to load events',
    'Failed to load resource',
    'the server responded with a status of 401',
    'status of 401',
    'goflow',
    'goflow--magnetai-4h4a8'
  ];
  
  // Suppress Chrome extension runtime errors and Firestore connection errors
  var originalError = console.error;
  console.error = function() {
    // Check all arguments (not just first one)
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    // Suppress Firestore connection/network errors (handled by SDK retry logic)
    // Check for specific Firestore error patterns
    if (matchesPattern(allText, ['ERR_QUIC_PROTOCOL_ERROR']) ||
        matchesPattern(allText, ['QUIC_PUBLIC_RESET']) ||
        (matchesPattern(allText, ['firestore.googleapis.com']) && 
         (matchesPattern(allText, ['Listen/channel']) ||
          matchesPattern(allText, ['Bad Request']) ||
          matchesPattern(allText, ['net::']))) ||
        matchesPattern(allText, ['WebChannelConnection']) ||
        (matchesPattern(allText, ['Firestore']) && matchesPattern(allText, ['transport errored']))) {
      return; // Suppress silently - transient network errors handled by Firestore SDK
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    // Check for various 401 error patterns
    if (matchesPattern(allText, ['Invalid or expired authentication']) ||
        (matchesPattern(allText, ['authentication']) && matchesPattern(allText, ['401'])) ||
        (matchesPattern(allText, ['ApiError']) && matchesPattern(allText, ['401'])) ||
        (matchesPattern(allText, ['Failed to load events']) && matchesPattern(allText, ['401'])) ||
        (matchesPattern(allText, ['401']) && matchesPattern(allText, ['Unauthorized'])) ||
        (matchesPattern(allText, ['401']) && matchesPattern(allText, ['calendar/events'])) ||
        (matchesPattern(allText, ['GET']) && matchesPattern(allText, ['401']) && matchesPattern(allText, ['goflow'])) ||
        (matchesPattern(allText, ['401']) && matchesPattern(allText, ['goflow--magnetai-4h4a8'])) ||
        (matchesPattern(allText, ['Unauthorized']) && matchesPattern(allText, ['goflow'])) ||
        (matchesPattern(allText, ['Failed to load resource']) && matchesPattern(allText, ['401'])) ||
        matchesPattern(allText, ['the server responded with a status of 401']) ||
        matchesPattern(allText, ['status of 401'])) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    // Check if any argument contains runtime error patterns
    var hasRuntimeError = allArgs.some(function(arg) {
      if (typeof arg === 'string') {
        return matchesPattern(arg, chromeExtensionPatterns);
      }
      // Also check Error objects (message, stack, toString)
      return checkErrorObject(arg, chromeExtensionPatterns);
    });
    
    // Check combined text for patterns (more comprehensive)
    if (matchesPattern(allText, chromeExtensionPatterns) || hasRuntimeError) {
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
    if (matchesPattern(allText, firestorePatterns) &&
        (matchesPattern(allText, ['WebChannelConnection']) ||
         matchesPattern(allText, ['Firestore']) && matchesPattern(allText, ['stream', 'Listen', 'connection']))) {
      return; // Suppress silently - Firestore SDK handles reconnection
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if (matchesPattern(allText, auth401Patterns) && matchesPattern(allText, ['401'])) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    // Suppress Chrome extension errors
    if (matchesPattern(allText, chromeExtensionPatterns)) {
      return; // Suppress silently - Chrome extension communication errors
    }
    originalWarn.apply(console, arguments);
  };
  
  // Chrome extension info message patterns
  var chromeInfoPatterns = ['[ChromePolyfill]', 'Chrome API support enabled', 'ChromePolyfill'];
  
  // Also suppress in console.log (some extensions log there)
  var originalLog = console.log;
  console.log = function() {
    var allArgs = Array.prototype.slice.call(arguments);
    var allText = allArgs.map(function(arg) {
      return arg?.toString() || '';
    }).join(' ');
    
    // Suppress Chrome extension messages (info messages, not errors)
    if (matchesPattern(allText, chromeInfoPatterns)) {
      return; // Suppress Chrome extension info messages
    }
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if (matchesPattern(allText, auth401Patterns) && matchesPattern(allText, ['401'])) {
      return; // Suppress silently - authentication errors are handled by UI
    }
    
    // Suppress Chrome extension errors
    if (matchesPattern(allText, chromeExtensionPatterns)) {
      return; // Suppress silently - Chrome extension communication errors
    }
    originalLog.apply(console, arguments);
  };
  
  // Intercept window.onerror
  var originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    var messageStr = message?.toString() || '';
    var sourceStr = source?.toString() || '';
    var combinedStr = messageStr + ' ' + sourceStr;
    
    // Suppress expected authentication errors (401) - handled gracefully by UI
    if (matchesPattern(messageStr, auth401Patterns) && matchesPattern(messageStr, ['401'])) {
      return true; // Suppress authentication errors
    }
    
    // Suppress Chrome extension errors (check message, source, and error object)
    // Also check source file name (e.g., content-script.js, web-client-content-script.js)
    if (matchesPattern(messageStr, chromeExtensionPatterns) ||
        matchesPattern(sourceStr, chromeExtensionPatterns) ||
        matchesPattern(combinedStr, chromeExtensionPatterns) ||
        checkErrorObject(error, chromeExtensionPatterns)) {
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

