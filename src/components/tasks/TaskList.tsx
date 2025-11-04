"use client";

import { useGoals } from "@/context/GoalContext";
import { TaskItem } from "./TaskItem";
import { ScrollArea } from "../ui/scroll-area";
import { useMemo } from "react";
import { priorities } from "@/app/types";

export function TaskList({ goalId }: { goalId: string }) {
  const { tasks } = useGoals();
  
  const goalTasks = useMemo(() => {
    const filteredTasks = tasks.filter(t => t.goalId === goalId);
    const priorityOrder = [...priorities].reverse();
    return filteredTasks.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
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
