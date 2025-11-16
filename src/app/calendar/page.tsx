'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { useCalendar, useBackendAuth } from '@/hooks/use-api';
import { CalendarEvent, ApiError } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, RefreshCw, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarEventCard } from '@/components/calendar/CalendarEventCard';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { ViewEventDialog } from '@/components/calendar/ViewEventDialog';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingAfterOAuth, setLoadingAfterOAuth] = useState(false);
  const eventsLoadedAfterOAuth = useRef(false);
  const prevMaxResults = useRef(maxResults);
  const resetFlagTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { listEvents, deleteEvent: deleteEventApi } = useCalendar();
  const { checkAuthStatus, initiateOAuthLogin } = useBackendAuth();
  const { toast } = useToast();

  // Check backend authentication status
  useEffect(() => {
    // Skip initial auth check if OAuth success is in URL (will be handled by OAuth useEffect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') === 'true') {
      // OAuth success handler will check auth, so skip this check
      return;
    }

    const checkAuth = async () => {
      // Only check if backend API is enabled
      // If backend is not enabled, skip authentication check
      if (!apiClient.useBackendApi()) {
        // Backend not enabled - assume authenticated to allow calendar access
        // This allows the calendar to work without backend API
        setIsBackendAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      // Backend is enabled - check authentication status
      try {
        const status = await checkAuthStatus();
        setIsBackendAuthenticated(status?.authenticated || false);
      } catch (err) {
        // If auth check fails, assume not authenticated
        setIsBackendAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [checkAuthStatus]);

  // Handle OAuth success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') === 'true') {
      // Clear query parameter from URL immediately
      window.history.replaceState({}, '', '/calendar');
      
      // Reload auth status and events
      const reload = async () => {
        try {
          // Set checkingAuth to true while verifying authentication
          setCheckingAuth(true);
          setError(null);
          
          const status = await checkAuthStatus();
          const authenticated = status?.authenticated || false;
          setIsBackendAuthenticated(authenticated);
          
          if (authenticated) {
            // Load events directly to avoid dependency issues
            setLoadingAfterOAuth(true); // Flag to prevent double loading
            setIsLoading(true);
            try {
              const timeMin = new Date().toISOString();
              const response = await listEvents(maxResults, timeMin);
              const eventsList = response.events || [];
              setEvents(eventsList);
              eventsLoadedAfterOAuth.current = true; // Mark that events were loaded
              
              // Show success toast only after events are loaded successfully
              toast({
                title: 'Login realizado com sucesso',
                description: `Seus eventos foram carregados com sucesso.${eventsList.length > 0 ? ` ${eventsList.length} evento(s) encontrado(s).` : ''}`,
              });
              
              // Debug log (only in development)
              if (process.env.NODE_ENV === 'development') {
                console.log('Events loaded after OAuth:', eventsList.length, 'events');
              }
            } catch (err: unknown) {
              // Only log unexpected errors in development
              if (process.env.NODE_ENV === 'development') {
                console.error('Failed to load events after OAuth:', err);
              }
              if (err instanceof ApiError && err.status === 401) {
                setIsBackendAuthenticated(false);
                setError('Erro ao carregar eventos. Por favor, tente novamente.');
              } else {
                const errorMessage = err instanceof ApiError 
                  ? err.message 
                  : (err instanceof Error ? err.message : 'Erro ao carregar eventos.');
                setError(errorMessage);
              }
            } finally {
              setIsLoading(false);
              setLoadingAfterOAuth(false);
              setCheckingAuth(false); // Set to false after events are loaded (or failed)
            }
          } else {
            // If not authenticated after OAuth success, show error
            setError('Autenticação não confirmada. Por favor, tente fazer login novamente.');
            setCheckingAuth(false); // Set to false when not authenticated
          }
        } catch (err) {
          console.error('Failed to reload after OAuth:', err);
          setCheckingAuth(false);
          setIsBackendAuthenticated(false);
          setError('Erro ao verificar autenticação. Por favor, recarregue a página.');
        }
      };
      
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intentionally empty: only runs once on mount to check for oauth_success parameter.
    // listEvents and maxResults are stable references from hooks/state, and we want to capture
    // their values at mount time to avoid re-running this effect unnecessarily.
  }, []); // Only run once on mount to check for oauth_success parameter

  // Load events
  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    // Reset flag when manually loading (user action)
    eventsLoadedAfterOAuth.current = false;
    // Cancel any pending timer since we're resetting the flag now
    if (resetFlagTimerRef.current) {
      clearTimeout(resetFlagTimerRef.current);
      resetFlagTimerRef.current = null;
    }

    try {
      const timeMin = new Date().toISOString();
      const response = await listEvents(maxResults, timeMin);
      setEvents(response.events || []);
    } catch (err: unknown) {
      // Handle authentication errors specifically
      if (err instanceof ApiError && err.status === 401) {
        // Don't log expected auth errors - they're handled gracefully
        setError('Autenticação necessária. Por favor, faça login com Google para acessar seu calendário.');
        setIsBackendAuthenticated(false);
        // Don't reload auth status here - already checked in useEffect
      } else {
        // Handle other errors (network, server errors, etc.)
        const errorMessage = err instanceof ApiError 
          ? err.message 
          : (err instanceof Error ? err.message : 'Erro ao carregar eventos do calendário. Por favor, tente novamente.');
        setError(errorMessage);
        // Only log unexpected errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load events:', err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset flag after OAuth loading completes and all states are stable
  // Delay to ensure the regular loading effect has already evaluated its conditions
  const FLAG_RESET_DELAY_MS = 200;
  
  useEffect(() => {
    // Only reset when loadingAfterOAuth transitions from true to false
    // This happens after OAuth completes
    if (!loadingAfterOAuth && eventsLoadedAfterOAuth.current) {
      // Wait for all loading states to be complete before resetting
      // This ensures the regular loading effect has already evaluated
      if (!isLoading && !checkingAuth) {
        // Clear any existing timer first (in case effect ran multiple times)
        if (resetFlagTimerRef.current) {
          clearTimeout(resetFlagTimerRef.current);
          resetFlagTimerRef.current = null;
        }
        
        // Use a small delay to ensure the regular loading effect has already evaluated
        // This prevents double loading by ensuring the flag stays true during the critical window
        resetFlagTimerRef.current = setTimeout(() => {
          // Only reset if flag is still true (hasn't been reset by other means)
          if (eventsLoadedAfterOAuth.current) {
            eventsLoadedAfterOAuth.current = false;
          }
          resetFlagTimerRef.current = null;
        }, FLAG_RESET_DELAY_MS); // Small delay to let the regular effect run first
      }
      // If loading states are not complete yet, wait for next render
      // The effect will run again when isLoading or checkingAuth change
    } else if (loadingAfterOAuth) {
      // If loadingAfterOAuth is true, cancel any pending timer
      // This handles the case where OAuth starts again before previous timer completes
      if (resetFlagTimerRef.current) {
        clearTimeout(resetFlagTimerRef.current);
        resetFlagTimerRef.current = null;
      }
    }
    
    // Cleanup: always cancel timer if effect runs again or component unmounts
    return () => {
      if (resetFlagTimerRef.current) {
        clearTimeout(resetFlagTimerRef.current);
        resetFlagTimerRef.current = null;
      }
    };
  }, [loadingAfterOAuth, isLoading, checkingAuth]);

  // Load events on mount and when maxResults changes (only if authenticated)
  // Skip if we're already loading after OAuth to avoid double loading
  useEffect(() => {
    // Check if maxResults actually changed
    const maxResultsChanged = prevMaxResults.current !== maxResults;
    
    // Reset flag when maxResults changes (user wants to reload with different count)
    // This is safe because maxResults change means we want to reload anyway
    if (maxResultsChanged && eventsLoadedAfterOAuth.current) {
      eventsLoadedAfterOAuth.current = false;
      // Cancel any pending timer since we're resetting the flag now
      if (resetFlagTimerRef.current) {
        clearTimeout(resetFlagTimerRef.current);
        resetFlagTimerRef.current = null;
      }
    }
    
    // Update prevMaxResults ONLY when maxResults actually changed
    // Skip on initial mount to avoid false positive on first render
    if (maxResultsChanged) {
      prevMaxResults.current = maxResults;
    }
    
    // Only load if:
    // 1. Not checking auth
    // 2. Authenticated (explicitly true, not just truthy)
    // 3. Not currently loading after OAuth
    // 4. Not already loading events
    // 5. Events weren't just loaded after OAuth (to prevent double loading)
    if (!checkingAuth && 
        isBackendAuthenticated === true && 
        !loadingAfterOAuth && 
        !isLoading &&
        !eventsLoadedAfterOAuth.current) {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxResults, checkingAuth, isBackendAuthenticated, loadingAfterOAuth]);

  // Handle delete event
  const handleDelete = async (eventId: string, summary: string) => {
    // Confirm deletion with user
    if (!confirm(`Tem certeza que deseja deletar "${summary}"?`)) {
      return;
    }

    try {
      await deleteEventApi(eventId);
      toast({
        title: 'Evento deletado',
        description: `"${summary}" foi removido do seu calendário.`,
      });
      // Reload events with error handling
      try {
        await loadEvents();
      } catch (reloadErr) {
        // Error already handled in loadEvents
        console.warn('Failed to reload events after delete:', reloadErr);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : (err instanceof Error ? err.message : 'Não foi possível deletar o evento.');
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar',
        description: errorMessage,
      });
    }
  };

  // Handle event created
  const handleEventCreated = async () => {
    setCreateDialogOpen(false);
    try {
      await loadEvents();
    } catch (err) {
      // Error already handled in loadEvents
      console.warn('Failed to reload events after creation:', err);
    }
  };

  // Handle event updated
  const handleEventUpdated = async () => {
    setEditingEvent(null);
    try {
      await loadEvents();
    } catch (err) {
      // Error already handled in loadEvents
      console.warn('Failed to reload events after update:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Google Calendar</h1>
              <p className="text-muted-foreground">
                Gerencie seus eventos do Google Calendar
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
            <Button
              onClick={loadEvents}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              Mostrar:
            </label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={5}>5 eventos</option>
              <option value={10}>10 eventos</option>
              <option value={20}>20 eventos</option>
              <option value={50}>50 eventos</option>
            </select>
          </div>
        </div>

        {/* Authentication Required Message */}
        {!checkingAuth && isBackendAuthenticated === false && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-800 dark:text-yellow-200">
                Você precisa autenticar com Google para acessar seu calendário.
              </span>
              <Button
                onClick={() => {
                  setIsLoading(true); // Show loading before redirect
                  initiateOAuthLogin();
                }}
                size="sm"
                className="ml-4 gap-2"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4" />
                {isLoading ? 'Redirecionando...' : 'Fazer Login'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && isBackendAuthenticated !== false && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {(isLoading || checkingAuth) && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {checkingAuth ? 'Verificando autenticação...' : isLoading ? 'Carregando eventos...' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        {!isLoading && !checkingAuth && isBackendAuthenticated === true && (
          <>
            {events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <CalendarIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Nenhum evento futuro
                  </h2>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Você não tem eventos agendados para o futuro. Crie seu primeiro evento!
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Evento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onView={(e) => setViewingEvent(e)}
                    onEdit={(e) => setEditingEvent(e)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialogs */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleEventCreated}
      />

      {editingEvent && (
        <EditEventDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
          onSuccess={handleEventUpdated}
        />
      )}

      {viewingEvent && (
        <ViewEventDialog
          open={!!viewingEvent}
          onOpenChange={(open) => !open && setViewingEvent(null)}
          event={viewingEvent}
        />
      )}
    </div>
  );
}
