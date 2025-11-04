'use client';

import { CalendarEvent } from "@/context/GoogleApiContext";
import { useGoals } from "@/context/GoalContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Goal } from "@/app/types";

interface CalendarEventItemProps {
    event: CalendarEvent;
    isSelected: boolean;
    onSelectionChange: (eventId: string, isSelected: boolean) => void;
}

export function CalendarEventItem({ event, isSelected, onSelectionChange }: CalendarEventItemProps) {
    const { goals, addGoal, addTask } = useGoals();
    const { toast } = useToast();

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


    const handleCreateTask = () => {
        const targetGoal = getOrCreateAgendaGoal();
        
        const deadline = event.start.dateTime ? new Date(event.start.dateTime) : undefined;
        let duration;
        if (event.start.dateTime && event.end.dateTime) {
            duration = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60);
        }

        addTask(
            targetGoal.id,
            event.summary,
            'Medium',
            'None',
            deadline,
            duration
        );

        toast({
            title: "Tarefa Criada!",
            description: `A tarefa "${event.summary}" foi adicionada à sua meta "${targetGoal.name}".`,
        });
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
