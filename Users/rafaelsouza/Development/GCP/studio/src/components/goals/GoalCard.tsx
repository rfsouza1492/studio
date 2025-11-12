
"use client";

import React, { useMemo, useEffect } from 'react';
import { Goal, Task } from '@/app/types';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { deleteGoal, tasks: allTasks, setTasksForGoal } = useGoals();
  const [editGoalOpen, setEditGoalOpen] = React.useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = React.useState(false);
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);

  const { user } = useUser();
  const firestore = useFirestore();

  // Memoize the query to prevent re-renders
  const tasksQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'goals', goal.id, 'tasks'));
  }, [user, firestore, goal.id]);

  // useCollection will fetch and listen to real-time updates for this goal's tasks
  const { data: goalTasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  
  // Update the central context when tasks for this goal are loaded/updated
  useEffect(() => {
    if (goalTasks) {
      setTasksForGoal(goal.id, goalTasks);
    }
  }, [goalTasks, goal.id, setTasksForGoal]);
  
  const { progress, progressText } = useMemo(() => {
    const tasksForThisGoal = allTasks.filter(t => t.goalId === goal.id);

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
    
    if (tasksForThisGoal.length > 0) {
      const completedTasks = tasksForThisGoal.filter(t => t.completed).length;
      return {
        progress: (completedTasks / tasksForThisGoal.length) * 100,
        progressText: `${completedTasks} de ${tasksForThisGoal.length} tarefas completas`
      };
    }

    return { progress: 0, progressText: 'Nenhuma tarefa ainda' };
  }, [goal, allTasks]);


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
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteGoalOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Deletar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex-1">
            <TaskList goalId={goal.id} tasks={allTasks.filter(t => t.goalId === goal.id)} isLoading={tasksLoading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setAddTaskOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tarefa
          </Button>
        </CardFooter>
      </Card>

      <AddOrEditGoalDialog open={editGoalOpen} onOpenChange={setEditGoalOpen} goal={goal} />
      <DeleteConfirmationDialog
        open={deleteGoalOpen}
        onOpenChange={setDeleteGoalOpen}
        onConfirm={() => deleteGoal(goal.id)}
        title="Deletar Meta"
        description={`Você tem certeza que quer deletar a meta "${goal.name}"? Todas as tarefas associadas também serão deletadas. Esta ação não pode ser desfeita.`}
      />
      <AddOrEditTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} goalId={goal.id} />
    </>
  );
}
