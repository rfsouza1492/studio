/**
 * React Hooks for GoFlow Backend API
 * Provides convenient hooks for API operations
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '@/lib/api-client';

/**
 * API Request State
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check backend health
 */
export function useHealthCheck() {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiClient.checkHealth();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to check health';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, checkHealth };
}

/**
 * Hook to get API info
 */
export function useApiInfo() {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    async function fetchInfo() {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        const data = await apiClient.getApiInfo();
        setState({ data, loading: false, error: null });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to fetch API info';
        setState({ data: null, loading: false, error: message });
      }
    }

    if (apiClient.useBackendApi()) {
      fetchInfo();
    }
  }, []);

  return state;
}

/**
 * Hook for Google Drive operations
 */
export function useDrive() {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const listFiles = useCallback(async (pageSize = 10, pageToken?: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiClient.listDriveFiles(pageSize, pageToken);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to list Drive files';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, listFiles };
}

/**
 * Hook for Google Calendar operations
 */
export function useCalendar() {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const listEvents = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiClient.listCalendarEvents();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to list calendar events';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  const createEvent = useCallback(async (event: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiClient.createCalendarEvent(event);
      setState(prev => ({ ...prev, loading: false }));
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create calendar event';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  return { ...state, listEvents, createEvent };
}

/**
 * Hook for backend authentication
 */
export function useBackendAuth() {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const checkAuthStatus = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiClient.getAuthStatus();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to check auth status';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiClient.loginWithEmail(email, password);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiClient.logout();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Logout failed';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  const initiateOAuthLogin = useCallback(() => {
    apiClient.initiateOAuthLogin();
  }, []);

  return {
    ...state,
    checkAuthStatus,
    loginWithEmail,
    logout,
    initiateOAuthLogin,
  };
}

/**
 * Hook to check if backend is available
 */
export function useBackendAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (!apiClient.useBackendApi()) {
        setAvailable(false);
        setChecking(false);
        return;
      }

      try {
        await apiClient.checkHealth();
        setAvailable(true);
      } catch (error) {
        console.warn('Backend API not available, falling back to Firebase', error);
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    }

    check();
  }, []);

  return { available, checking };
}

