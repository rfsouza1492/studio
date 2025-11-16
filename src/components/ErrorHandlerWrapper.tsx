'use client';

import { ReactNode } from 'react';

/**
 * Wrapper component that wraps children for error handling
 * 
 * IMPORTANT: Error handlers are already initialized via ERROR_HANDLER_INLINE_SCRIPT
 * in the <head> of layout.tsx. This wrapper does NOT import error-handler.ts
 * to avoid double-wrapping handlers and pattern matching conflicts.
 * 
 * The inline script (error-handler-init.ts) provides comprehensive error suppression
 * including Firestore errors, 401 authentication errors, Chrome extension errors,
 * and more. Importing error-handler.ts would wrap the already-wrapped handlers,
 * causing the less comprehensive patterns in error-handler.ts to override the
 * more comprehensive patterns in error-handler-init.ts.
 */
export function ErrorHandlerWrapper({ children }: { children: ReactNode }) {
  // Error handlers are already initialized via inline script in <head>
  // No need to import error-handler.ts here - it would cause double-wrapping
  return <>{children}</>;
}

