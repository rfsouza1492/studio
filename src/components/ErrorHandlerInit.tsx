'use client';

import { useEffect } from 'react';

/**
 * Client-side component to initialize error handler
 * This ensures error handler only runs on client side, preventing hydration issues
 */
export function ErrorHandlerInit() {
  useEffect(() => {
    // Dynamically import error handler only on client side
    import('@/lib/error-handler');
  }, []);

  return null;
}

