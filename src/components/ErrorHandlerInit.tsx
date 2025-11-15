'use client';

import { useEffect } from 'react';

/**
 * Client-side component to initialize error handler
 * This ensures error handler only runs on client side, preventing hydration issues
 */
export function ErrorHandlerInit() {
  useEffect(() => {
    // Dynamically import error handler only on client side
    // Handle import errors gracefully - if error handler fails to load,
    // the app should still function (just without error suppression)
    import('@/lib/error-handler').catch((error) => {
      // Silently handle import failures - error handler is non-critical
      // Log only in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load error handler:', error);
      }
    });
  }, []);

  return null;
}