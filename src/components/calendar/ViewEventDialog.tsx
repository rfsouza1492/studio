'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/lib/api-client';
import { Clock, MapPin, ExternalLink, Repeat, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
}

export function ViewEventDialog({ open, onOpenChange, event }: ViewEventDialogProps) {
  const startDate = event.start.dateTime ? parseISO(event.start.dateTime) : null;
  const endDate = event.end.dateTime ? parseISO(event.end.dateTime) : null;

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const isRecurring = event.recurrence && event.recurrence.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Evento</DialogTitle>
          <DialogDescription>
            Informações completas do evento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title and Badge */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h3 className="text-xl font-bold flex-1">{event.summary}</h3>
              {isRecurring && (
                <Badge variant="secondary" className="gap-1">
                  <Repeat className="h-3 w-3" />
                  Recorrente
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Descrição
              </h4>
              <p className="text-base whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          {startDate && endDate && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-base font-medium text-primary">
                  {formatDateTime(startDate)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  até {format(endDate, "HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </h4>
              <p className="text-base">{event.location}</p>
            </div>
          )}

          {/* Recurrence */}
          {isRecurring && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recorrência
              </h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <Badge variant="secondary" className="mb-2">Evento Recorrente</Badge>
                {event.recurrence.map((rule, index) => (
                  <code key={index} className="block text-xs text-muted-foreground mt-1 font-mono">
                    {rule}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Participantes
              </h4>
              <div className="space-y-1">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {attendee.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            {event.htmlLink ? (
              <Button variant="outline" asChild className="gap-2">
                <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Abrir no Google Calendar
                </a>
              </Button>
            ) : (
              <div></div>
            )}
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

