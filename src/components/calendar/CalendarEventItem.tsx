
'use client';

import { CalendarEvent } from "@/app/calendar/page";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { PlusCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useGoals } from "@/context/GoalContext";

interface CalendarEventItemProps {
    event: CalendarEvent;
    isSelected: boolean;
    onSelectionChange: (eventId: string, isSelected: boolean) => void;
}

export function CalendarEventItem({ event, isSelected, onSelectionChange }: CalendarEventItemProps) {
    const { toast } = useToast();
    const { addTask } = useGoals();
    const { goals } = useGoals(); // To find a goal to add the task to

    const getEventTime = (event: CalendarEvent): string => {
        if (event.start.dateTime) {
            const start = new Date(event.start.dateTime);
            const end = event.end.dateTime ? new Date(event.end.dateTime) : null;
            let timeString = format(start, "p");
            if (end) {
                timeString += ` - ${format(end, "p")}`;
            }
            return timeString;
        }
        if (event.start.date) {
            return 'O dia todo';
        }
        return "Horário não especificado";
    };

    const handleCreateTask = async () => {
        let calendarGoal = goals.find(g => g.name === "Tarefas da Agenda");

        const start = event.start.dateTime ? parseISO(event.start.dateTime) : new Date();
        const end = event.end.dateTime ? parseISO(event.end.dateTime) : new Date();
        const duration = differenceInMinutes(end, start);
        
        try {
            await addTask(
                calendarGoal!.id,
                event.summary,
                'Medium',
                'None',
                start,
                duration > 0 ? duration : undefined
            );

             toast({
                title: "Tarefa Criada",
                description: `A tarefa "${event.summary}" foi criada a partir do evento da agenda.`,
            });

        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Função Indisponível",
                description: "Não foi possível criar a tarefa a partir do evento.",
            });
        }
    };

    const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            onSelectionChange(event.id, checked);
        }
    };

    return (
        <div className={cn(
            "flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-all",
            isSelected ? "bg-accent/80 border-primary/50" : "hover:bg-accent/50"
        )}>
            <div className="flex flex-1 items-center gap-4">
                <Checkbox
                    id={`select-event-${event.id}`}
                    checked={isSelected}
                    onCheckedChange={handleCheckboxChange}
                    aria-label={`Selecionar evento ${event.summary}`}
                />
                <div className="flex-1">
                    <p className="font-semibold text-card-foreground">{event.summary}</p>
                    <p className="text-sm text-muted-foreground">{getEventTime(event)}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCreateTask}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Tarefa
            </Button>
        </div>
    );
}
