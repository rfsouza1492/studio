/**
 * Hook to monitor session expiry and show warnings
 * Shows warning 5 minutes before session expires
 */

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const WARNING_TIME_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

interface SessionExpiryState {
  expiresAt: Date | null;
  timeRemaining: number | null;
  showWarning: boolean;
}

export function useSessionExpiry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<SessionExpiryState>({
    expiresAt: null,
    timeRemaining: null,
    showWarning: false,
  });
  const [warningShown, setWarningShown] = useState(false);

  // Calculate session expiry time
  const calculateExpiry = useCallback(() => {
    if (!user) {
      return null;
    }

    // Get login time from user metadata (if available)
    // For now, we'll use a fixed 24-hour duration from "now"
    // In production, you'd track actual login time
    const loginTime = user.metadata.lastSignInTime 
      ? new Date(user.metadata.lastSignInTime).getTime()
      : Date.now();
    
    return new Date(loginTime + SESSION_DURATION);
  }, [user]);

  // Format time remaining as human-readable string
  const formatTimeRemaining = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} e ${minutes % 60} minuto${minutes % 60 !== 1 ? 's' : ''}`;
    }
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }, []);

  // Show expiry warning toast
  const showExpiryWarning = useCallback((timeRemaining: number) => {
    if (warningShown) return;

    const timeStr = formatTimeRemaining(timeRemaining);
    
    toast({
      title: 'Sessão expirando em breve',
      description: `Sua sessão expirará em ${timeStr}. Faça login novamente para continuar.`,
      variant: 'destructive',
      duration: 10000, // Show for 10 seconds
    });

    setWarningShown(true);
  }, [formatTimeRemaining, toast, warningShown]);
  
  // Reset warning shown when user changes
  useEffect(() => {
    setWarningShown(false);
  }, [user?.uid]);

  // Check session expiry
  useEffect(() => {
    if (!user) {
      setState({
        expiresAt: null,
        timeRemaining: null,
        showWarning: false,
      });
      setWarningShown(false);
      return;
    }

    const expiresAt = calculateExpiry();
    if (!expiresAt) {
      return;
    }

    const checkExpiry = () => {
      const now = Date.now();
      const expiryTime = expiresAt.getTime();
      const timeRemaining = expiryTime - now;

      // Session expired
      if (timeRemaining <= 0) {
        setState({
          expiresAt,
          timeRemaining: 0,
          showWarning: true,
        });
        return;
      }

      // Show warning if within warning time
      const shouldShowWarning = timeRemaining <= WARNING_TIME_BEFORE_EXPIRY;
      
      setState({
        expiresAt,
        timeRemaining,
        showWarning: shouldShowWarning,
      });

      // Show toast warning once when entering warning period
      if (shouldShowWarning && !warningShown) {
        showExpiryWarning(timeRemaining);
      }
    };

    // Check immediately
    checkExpiry();

    // Check periodically
    const interval = setInterval(checkExpiry, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, calculateExpiry, warningShown, showExpiryWarning]);

  return {
    expiresAt: state.expiresAt,
    timeRemaining: state.timeRemaining,
    showWarning: state.showWarning,
    isExpired: state.timeRemaining !== null && state.timeRemaining <= 0,
    formatTimeRemaining,
  };
}

