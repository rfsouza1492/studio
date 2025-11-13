
"use client";

import { TaskItem } from "./TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";
import { priorities, Task } from "@/app/types";
import { differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskList({ goalId, tasks, isLoading }: { goalId: string, tasks: Task[], isLoading: boolean }) {
  
  const sortedTasks = useMemo(() => {
    const priorityOrder = [...priorities].reverse();

    const getDaysRemaining = (deadline: string | null | undefined): number => {
        if (!deadline) return Infinity;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return differenceInDays(deadlineDate, today);
    };

    return [...tasks].sort((a, b) => {
        // Sort by completion status (incomplete first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Sort by deadline (earlier first)
        const daysRemainingA = getDaysRemaining(a.deadline);
        const daysRemainingB = getDaysRemaining(b.deadline);
        if (daysRemainingA !== daysRemainingB) {
            return daysRemainingA - daysRemainingB;
        }
      
      // Sort by priority (higher first)
      const priorityA = priorityOrder.indexOf(a.priority);
      const priorityB = priorityOrder.indexOf(b.priority);
      if (priorityA !== priorityB) {
          return priorityA - priorityB;
      }

      return 0; // Keep original order if all else is equal
    });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (sortedTasks.length === 0) {
    return (
      <div className="flex h-full min-h-[48px] items-center justify-center rounded-lg border-2 border-dashed border-primary/10 p-4 text-center">
        <p className="text-sm text-muted-foreground">Adicione uma tarefa para começar.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 pr-4">
      <div className="space-y-2">
        {sortedTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </ScrollArea>
  );
}
