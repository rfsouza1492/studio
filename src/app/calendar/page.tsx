'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useCalendar } from '@/hooks/use-api';
import { CalendarEvent } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarEventCard } from '@/components/calendar/CalendarEventCard';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { EditEventDialog } from '@/components/calendar/EditEventDialog';
import { ViewEventDialog } from '@/components/calendar/ViewEventDialog';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);

  const { listEvents, deleteEvent: deleteEventApi } = useCalendar();
  const { toast } = useToast();

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
      setError(err.message || 'Failed to load calendar events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on mount and when maxResults changes
  useEffect(() => {
    loadEvents();
  }, [maxResults]);

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
      loadEvents(); // Reload events
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar',
        description: err.message || 'Não foi possível deletar o evento.',
      });
    }
  };

  // Handle event created
  const handleEventCreated = () => {
    setCreateDialogOpen(false);
    loadEvents();
  };

  // Handle event updated
  const handleEventUpdated = () => {
    setEditingEvent(null);
    loadEvents();
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

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Carregando eventos...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        {!isLoading && !error && (
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

