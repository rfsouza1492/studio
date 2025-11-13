'use client';

/**
 * Global Error Handler for Unhandled Promise Rejections
 * Prevents "Uncaught (in promise)" errors from appearing in console
 */

if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    
    // Suppress Chrome extension errors
    if (message.includes('message port closed') || 
        message.includes('runtime.lastError') ||
        message.includes('Extension context invalidated') ||
        (reason?.name === 'ChromeExtensionError')) {
      event.preventDefault();
      return;
    }

    // Suppress abort/cancellation errors (handled by api-client)
    if (message.includes('Request was cancelled') ||
        message.includes('Request timeout') ||
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

  // Suppress Chrome extension runtime errors
  const originalError = console.error;
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
      // Suppress Chrome extension errors (similar to checking chrome.runtime.lastError)
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
}

