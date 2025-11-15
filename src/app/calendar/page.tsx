'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useCalendar, useBackendAuth } from '@/hooks/use-api';
import { CalendarEvent, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { listEvents, deleteEvent: deleteEventApi } = useCalendar();
  const { checkAuthStatus, initiateOAuthLogin } = useBackendAuth();
  const { toast } = useToast();

  // Check backend authentication status
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if backend API is enabled
      if (!apiClient.useBackendApi()) {
        setIsBackendAuthenticated(true); // Skip check if backend not enabled
        setCheckingAuth(false);
        return;
      }

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

  // Load events
  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const timeMin = new Date().toISOString();
      const response = await listEvents(maxResults, timeMin);
      setEvents(response.events || []);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      
      // Handle authentication errors specifically
      if (err instanceof ApiError && err.status === 401) {
        setError('Autenticação necessária. Por favor, faça login com Google para acessar seu calendário.');
        setIsBackendAuthenticated(false);
      } else {
        setError(err.message || 'Failed to load calendar events. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on mount and when maxResults changes (only if authenticated)
  useEffect(() => {
    if (!checkingAuth && isBackendAuthenticated) {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxResults, checkingAuth, isBackendAuthenticated]);

  // Handle delete event
  const handleDelete = async (eventId: string, summary: string) => {
    if (!confirm(`Tem certeza que deseja deletar "${summary}"?`)) {
      return;
    }

    try {
      await deleteEventApi(eventId);
      toast({
        title: 'Evento deletado',
        description: 'O evento foi removido do seu calendário.',
      });
      // Reload events with error handling
      try {
        await loadEvents();
      } catch (reloadErr) {
        // Error already handled in loadEvents
        console.warn('Failed to reload events after delete:', reloadErr);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar',
        description: err.message || 'Não foi possível deletar o evento.',
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
                onClick={initiateOAuthLogin}
                size="sm"
                className="ml-4 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Fazer Login
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
        {!isLoading && !checkingAuth && isBackendAuthenticated && !error && (
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
