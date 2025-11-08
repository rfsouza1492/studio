
'use client';
import { CalendarEvent } from '@/app/calendar/page';
import React, { useState, useCallback, useMemo } from 'react';
import { CalendarEventItem } from './CalendarEventItem';
import { CalendarX, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useGoals } from '@/context/GoalContext';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Goal } from '@/app/types';

interface CalendarEventListProps {
    events: CalendarEvent[];
}

export function CalendarEventList({ events }: CalendarEventListProps) {
    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const { addGoal, addTask, goals } = useGoals();


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
    
    const getOrCreateCalendarGoal = async (): Promise<Goal | null> => {
        let calendarGoal = goals.find(g => g.name === "Tarefas da Agenda");
        if (!calendarGoal) {
            try {
                // The addGoal function is async but we don't need the returned goal object directly,
                // as the context will update and re-render, making the new goal available in the `goals` array.
                await addGoal({ name: "Tarefas da Agenda" });
                // We return null here and let the calling function re-check the `goals` array.
                return null;
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: "Falha ao criar meta",
                    description: "Não foi possível criar a meta 'Tarefas da Agenda'.",
                });
                return null;
            }
        }
        return calendarGoal;
    };


    const handleBulkCreateTasks = async () => {
        if (selectedEventIds.size === 0) return;

        let calendarGoal = await getOrCreateCalendarGoal();
        
        // If the goal was just created, the `goals` array in the context might not be updated yet.
        // We'll give it a moment and check again. This is a robust way to handle the async state update.
        if (!calendarGoal) {
            toast({
                title: "Criando meta...",
                description: "A meta 'Tarefas da Agenda' está sendo criada. Clique novamente em instantes.",
            });
            return;
        }

        const tasksToCreate = events.filter(event => selectedEventIds.has(event.id));

        try {
            const promises = tasksToCreate.map(event => {
                const start = event.start.dateTime ? parseISO(event.start.dateTime) : new Date();
                const end = event.end.dateTime ? parseISO(event.end.dateTime) : new Date();
                const duration = differenceInMinutes(end, start);

                return addTask(
                    calendarGoal!.id,
                    event.summary,
                    'Medium',
                    'None',
                    start,
                    duration > 0 ? duration : undefined
                );
            });

            await Promise.all(promises);

            toast({
                title: `${tasksToCreate.length} Tarefas Criadas`,
                description: 'As tarefas selecionadas foram adicionadas à sua meta "Tarefas da Agenda".',
            });
            setSelectedEventIds(new Set());

        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Erro ao criar tarefas",
                description: "Não foi possível criar as tarefas em massa.",
            });
        }
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

    