"use client";

import React, { useMemo } from 'react';
import { Goal } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { TaskList } from '../tasks/TaskList';
import { AddOrEditGoalDialog } from '../dialogs/AddOrEditGoalDialog';
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog';
import { AddOrEditTaskDialog } from '../dialogs/AddOrEditTaskDialog';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { tasks, deleteGoal } = useGoals();
  const [editGoalOpen, setEditGoalOpen] = React.useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = React.useState(false);
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);

  const goalTasks = useMemo(() => tasks.filter(t => t.goalId === goal.id), [tasks, goal.id]);
  
  const { progress, progressText } = useMemo(() => {
    if (goal.kpiTarget && goal.kpiTarget > 0) {
      const current = goal.kpiCurrent || 0;
      const target = goal.kpiTarget;
      const progressValue = (current / target) * 100;
      const kpiText = goal.kpiName ? `: ${goal.kpiName}` : '';
      return {
        progress: progressValue,
        progressText: `${current} / ${target}${kpiText}`
      };
    }
    
    // Fallback to task-based progress
    const completedTasks = goalTasks.filter(t => t.completed).length;
    const totalTasks = goalTasks.length;
    if (totalTasks > 0) {
      return {
        progress: (completedTasks / totalTasks) * 100,
        progressText: `${completedTasks} of ${totalTasks} tasks completed`
      };
    }

    return { progress: 0, progressText: 'No tasks yet' };
  }, [goal, goalTasks]);


  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-xl">{goal.name}</CardTitle>
            <CardDescription className="mt-1">
              {progressText}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditGoalOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteGoalOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex-1">
            <TaskList goalId={goal.id} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setAddTaskOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardFooter>
      </Card>

      <AddOrEditGoalDialog open={editGoalOpen} onOpenChange={setEditGoalOpen} goal={goal} />
      <DeleteConfirmationDialog
        open={deleteGoalOpen}
        onOpenChange={setDeleteGoalOpen}
        onConfirm={() => deleteGoal(goal.id)}
        title="Delete Goal"
        description={`Are you sure you want to delete the goal "${goal.name}"? All associated tasks will also be deleted. This action cannot be undone.`}
      />
      <AddOrEditTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} goalId={goal.id} />
    </>
  );
}
