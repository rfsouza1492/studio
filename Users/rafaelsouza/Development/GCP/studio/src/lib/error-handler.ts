'use client';

/**
 * Global Error Handler for Unhandled Promise Rejections and Console Errors
 * Prevents benign errors from Chrome extensions from polluting the console.
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

    // Suppress abort/cancellation errors (already handled by api-client)
    if (message.includes('Request was cancelled') ||
        message.includes('Request timeout') ||
        message.includes('timeout') ||
        message.includes('AbortError') ||
        (reason?.name === 'AbortError')) {
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
      // In production, prevent default to avoid console errors but don't log
      event.preventDefault();
    }
  });

  // Suppress Chrome extension runtime errors from appearing in console.error
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
        message.includes('The message port closed') ||
        hasLastError) {
      // Suppress Chrome extension errors (similar to checking chrome.runtime.lastError)
      return;
    }
    originalError.apply(console, args);
  };

  // Proactively handle chrome.runtime.sendMessage to avoid the error
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const originalSendMessage = chrome.runtime.sendMessage;
    if (originalSendMessage) {
      chrome.runtime.sendMessage = function(...args: any[]) {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          const wrappedCallback = function(response: any) {
            if (chrome.runtime.lastError) {
              // Handle the error silently, e.g., the port was closed
              if (process.env.NODE_ENV === 'development') {
                // This log can be useful for debugging extensions, but we can keep it silent
                // console.warn('Suppressed sendMessage error:', chrome.runtime.lastError.message);
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
