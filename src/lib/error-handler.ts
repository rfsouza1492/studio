'use client';

/**
 * Global Error Handler for Unhandled Promise Rejections
 * Prevents "Uncaught (in promise)" errors from appearing in console
 */

if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress Chrome extension errors
    if (event.reason?.message?.includes('message port closed') || 
        event.reason?.message?.includes('runtime.lastError')) {
      event.preventDefault();
      return;
    }

    // Suppress timeout errors from getRedirectResult (handled in AuthContext)
    if (event.reason?.message?.includes('timeout') || 
        event.reason?.message?.includes('getRedirectResult')) {
      event.preventDefault();
      return;
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
    if (message.includes('runtime.lastError') || 
        message.includes('message port closed')) {
      // Suppress Chrome extension errors
      return;
    }
    originalError.apply(console, args);
  };
}

