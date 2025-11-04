'use client';
import { CalendarEvent } from '@/context/GoogleApiContext';
import React from 'react';
import { CalendarEventItem } from './CalendarEventItem';
import { CalendarX } from 'lucide-react';

interface CalendarEventListProps {
    events: CalendarEvent[];
}

export function CalendarEventList({ events }: CalendarEventListProps) {
    if (events.length === 0) {
        return (
             <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-card p-12 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CalendarX className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-card-foreground">
                    Nenhum evento para hoje
                </h2>
                <p className="mt-2 max-w-sm text-center text-muted-foreground">
                    Sua agenda para hoje está livre!
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {events.map(event => (
                <CalendarEventItem key={event.id} event={event} />
            ))}
        </div>
    );
}
