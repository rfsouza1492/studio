"use client";
import React from 'react';
import { Task } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddOrEditTaskDialog } from '../dialogs/AddOrEditTaskDialog';
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog';

export function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useGoals();
  const [editTaskOpen, setEditTaskOpen] = React.useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = React.useState(false);

  return (
    <>
      <div className="group flex items-center justify-between rounded-md bg-background p-2 pr-1 transition-colors hover:bg-accent">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <label
            htmlFor={`task-${task.id}`}
            className={cn("text-sm transition-colors", task.completed && "text-muted-foreground line-through")}
          >
            {task.title}
          </label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditTaskOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDeleteTaskOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AddOrEditTaskDialog open={editTaskOpen} onOpenChange={setEditTaskOpen} task={task} goalId={task.goalId} />
      <DeleteConfirmationDialog
        open={deleteTaskOpen}
        onOpenChange={setDeleteTaskOpen}
        onConfirm={() => deleteTask(task.id)}
        title="Delete Task"
        description={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
      />
    </>
  );
}
