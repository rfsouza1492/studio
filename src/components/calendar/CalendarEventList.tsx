'use client';
import { CalendarEvent } from '@/app/calendar/page';
import React, { useState, useCallback, useMemo } from 'react';
import { CalendarEventItem } from './CalendarEventItem';
import { CalendarX, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

interface CalendarEventListProps {
    events: CalendarEvent[];
}

export function CalendarEventList({ events }: CalendarEventListProps) {
    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const handleSelectionChange = useCallback((eventId: string, isSelected: boolean) => {
        setSelectedEventIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(eventId);
            } else {
                newSet.delete(eventId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEventIds(new Set(events.map(e => e.id)));
        } else {
            setSelectedEventIds(new Set());
        }
    };
    
    const handleBulkCreateTasks = () => {
        if (selectedEventIds.size === 0) return;

        // A funcionalidade está desativada, pois o GoogleApiContext foi removido.
        toast({
            variant: 'destructive',
            title: "Função Indisponível",
            description: "A criação de tarefas a partir de eventos do calendário está temporariamente desativada.",
        });
    };

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
    
    const allSelected = selectedEventIds.size > 0 && selectedEventIds.size === events.length;

    return (
        <div className="space-y-3">
             {selectedEventIds.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-accent/50 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="select-all"
                            checked={allSelected}
                            onCheckedChange={(checked) => handleSelectAll(checked === true)}
                            aria-label="Selecionar todos os eventos"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium">
                            {selectedEventIds.size} selecionado(s)
                        </label>
                    </div>
                    <Button size="sm" onClick={handleBulkCreateTasks}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Tarefas Selecionadas
                    </Button>
                </div>
            )}
            {events.map(event => (
                <CalendarEventItem 
                    key={event.id} 
                    event={event}
                    isSelected={selectedEventIds.has(event.id)}
                    onSelectionChange={handleSelectionChange}
                />
            ))}
        </div>
    );
}
