"use client";

import { useSessionExpiry } from '@/hooks/use-session-expiry';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Component to monitor session expiry and show warnings
 * Automatically logs out user when session expires
 */
export function SessionExpiryMonitor() {
  const { expiresAt, timeRemaining, showWarning, isExpired, formatTimeRemaining } = useSessionExpiry();
  const router = useRouter();
  const { signOut } = useAuth();

  // Handle session expiry - redirect to login
  useEffect(() => {
    if (isExpired) {
      // Session expired - sign out and redirect to login
      // Use a flag to prevent multiple simultaneous logout attempts
      let isLoggingOut = false;
      
      const handleLogout = async () => {
        if (isLoggingOut) return;
        isLoggingOut = true;
        
        try {
          await signOut();
          router.push('/login');
        } catch (error) {
          console.error('Error signing out after session expiry:', error);
          // Force redirect even if signOut fails
          router.push('/login');
        }
      };
      
      handleLogout();
    }
  }, [isExpired, signOut, router]);

  // This component doesn't render anything - it just monitors and shows toasts
  // The useSessionExpiry hook handles toast notifications
  return null;
}

