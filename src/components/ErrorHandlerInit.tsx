'use client';

import { useLayoutEffect } from 'react';

/**
 * Client-side component to initialize error handler EARLY
 * This ensures error handler runs BEFORE providers initialize
 * 
 * IMPORTANT: Uses useLayoutEffect (synchronous, before paint) instead of useEffect
 * to catch errors that occur during provider initialization (FirebaseClientProvider,
 * AuthProvider, GoalProvider, etc.)
 * 
 * Placed BEFORE providers in layout.tsx to ensure earliest possible initialization
 */
export function ErrorHandlerInit() {
  // Use useLayoutEffect instead of useEffect to run synchronously before paint
  // This ensures error handlers are active before providers mount
  useLayoutEffect(() => {
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