'use client';

import React from 'react';
import { CalendarEvent } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Eye, Pencil, Trash2, ExternalLink, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onView: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string, summary: string) => void;
}

export function CalendarEventCard({ event, onView, onEdit, onDelete }: CalendarEventCardProps) {
  const startDate = event.start.dateTime ? parseISO(event.start.dateTime) : null;
  const endDate = event.end.dateTime ? parseISO(event.end.dateTime) : null;

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const isRecurring = event.recurrence && event.recurrence.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Event Info */}
          <div className="flex-1 min-w-0">
            {/* Title and Badge */}
            <div className="flex items-start gap-3 mb-3">
              <h3 className="text-lg font-semibold text-card-foreground flex-1 min-w-0 break-words">
                {event.summary}
              </h3>
              {isRecurring && (
                <Badge variant="secondary" className="flex-shrink-0 gap-1">
                  <Repeat className="h-3 w-3" />
                  Recorrente
                </Badge>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Time */}
            {startDate && endDate && (
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  {formatDateTime(startDate)} → {format(endDate, 'HH:mm')}
                </span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(event)}
              className="gap-2 justify-start"
            >
              <Eye className="h-4 w-4" />
              Ver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(event)}
              className="gap-2 justify-start"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(event.id, event.summary)}
              className="gap-2 justify-start text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Deletar
            </Button>
            {event.htmlLink && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="gap-2 justify-start"
              >
                <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Google
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

