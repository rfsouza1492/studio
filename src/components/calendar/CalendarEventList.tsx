'use client';
import { CalendarEvent } from '@/context/GoogleApiContext';
import React, { useState, useCallback, useMemo } from 'react';
import { CalendarEventItem } from './CalendarEventItem';
import { CalendarX, PlusCircle } from 'lucide-react';
import { useGoals } from '@/context/GoalContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import { Goal } from '@/app/types';

interface CalendarEventListProps {
    events: CalendarEvent[];
}

export function CalendarEventList({ events }: CalendarEventListProps) {
    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
    const { goals, addGoal, addTask } = useGoals();
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

    const selectedEvents = useMemo(() => {
        return events.filter(event => selectedEventIds.has(event.id));
    }, [events, selectedEventIds]);
    
    const getOrCreateAgendaGoal = (): Goal => {
        const goalName = "Tarefas da Agenda";
        let targetGoal = goals.find(g => g.name === goalName);

        if (!targetGoal) {
            const newGoal: Goal = {
                id: crypto.randomUUID(),
                name: goalName,
            };
            addGoal(newGoal);
            toast({
                title: `Meta "${goalName}" criada`,
                description: "As tarefas de eventos da agenda serão adicionadas aqui.",
            });
            // Since context updates might not be immediate, we'll return the new goal object
            // so the calling function can use it right away.
            return newGoal;
        }
        return targetGoal;
    };


    const handleBulkCreateTasks = () => {
        if (selectedEvents.length === 0) return;

        const targetGoal = getOrCreateAgendaGoal();

        let tasksCreatedCount = 0;
        selectedEvents.forEach(event => {
            const deadline = event.start.dateTime ? new Date(event.start.dateTime) : undefined;
            let duration;
            if (event.start.dateTime && event.end.dateTime) {
                duration = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60);
            }

            addTask(
                targetGoal!.id,
                event.summary,
                'Medium',
                'None',
                deadline,
                duration
            );
            tasksCreatedCount++;
        });

        if (tasksCreatedCount > 0) {
            toast({
                title: "Tarefas Criadas em Massa!",
                description: `${tasksCreatedCount} novas tarefas foram adicionadas à meta "${targetGoal.name}".`,
            });
        }
        
        setSelectedEventIds(new Set());
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
    const isIndeterminate = selectedEventIds.size > 0 && !allSelected;

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
