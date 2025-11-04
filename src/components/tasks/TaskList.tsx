"use client";

import { useGoals } from "@/context/GoalContext";
import { TaskItem } from "./TaskItem";
import { ScrollArea } from "../ui/scroll-area";
import { useMemo } from "react";
import { priorities, Task } from "@/app/types";
import { differenceInDays } from "date-fns";

export function TaskList({ goalId }: { goalId: string }) {
  const { tasks } = useGoals();
  
  const goalTasks = useMemo(() => {
    const filteredTasks = tasks.filter(t => t.goalId === goalId);
    const priorityOrder = [...priorities].reverse();

    const getDaysRemaining = (deadline: string | undefined): number => {
        if (!deadline) return Infinity;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return differenceInDays(deadlineDate, today);
    };

    return filteredTasks.sort((a, b) => {
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
  }, [tasks, goalId]);

  if (goalTasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-primary/10 p-4 text-center">
        <p className="text-sm text-muted-foreground">Add a task to get started.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 pr-4">
      <div className="space-y-2">
        {goalTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </ScrollArea>
  );
}
