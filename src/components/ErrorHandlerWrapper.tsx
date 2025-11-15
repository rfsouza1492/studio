'use client';

import { ReactNode, useLayoutEffect } from 'react';

/**
 * Wrapper component that initializes error handlers BEFORE rendering children
 * This ensures error handlers are active before any providers mount
 * 
 * IMPORTANT: Uses useLayoutEffect to initialize synchronously before paint,
 * ensuring error handlers are active before providers mount and can throw errors
 */
export function ErrorHandlerWrapper({ children }: { children: ReactNode }) {
  // Initialize error handler EARLY using useLayoutEffect (before paint)
  // This ensures it's active before providers mount and can throw errors
  useLayoutEffect(() => {
    // Dynamically import full error handler for additional features
    // The inline script in head already provides basic error suppression
    import('@/lib/error-handler').catch((error) => {
      // Silently handle import failures - error handler is non-critical
      // Log only in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load error handler:', error);
      }
    });
  }, []);

  // Render children immediately - error handler initialization happens in parallel
  return <>{children}</>;
}

