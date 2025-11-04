
'use client';
import React, { useMemo, useEffect, useCallback } from 'react';
import { useGoals } from '@/context/GoalContext';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Header } from '@/components/layout/Header';
import { ListTodo } from 'lucide-react';
import { isToday, isPast, startOfToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Task } from '@/app/types';

export default function TodayPage() {
  const { tasks, editTask, addTask } = useGoals();

  const handleRecurringTasks = useCallback(() => {
    const today = startOfToday();
    const tasksToUpdate: Task[] = [];
    const tasksToAdd: Parameters<typeof addTask>[] = [];

    tasks.forEach(task => {
        if (task.recurrence === 'Daily' && task.deadline && isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline))) {
           
            const newDeadline = new Date(task.deadline);
            newDeadline.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());

            const taskAlreadyExistsForToday = tasks.some(t => 
                t.title === task.title && 
                t.deadline && 
                isToday(new Date(t.deadline))
            );

            if (!taskAlreadyExistsForToday) {
                tasksToAdd.push([
                    task.goalId,
                    task.title,
                    task.priority,
                    task.recurrence,
                    newDeadline,
                    task.duration,
                    false
                ]);
            }
            
            if (task.recurrence !== 'None') {
              tasksToUpdate.push({ ...task, recurrence: 'None' });
            }
        }
    });

    if (tasksToUpdate.length > 0 || tasksToAdd.length > 0) {
        tasksToUpdate.forEach(editTask);
        tasksToAdd.forEach(args => addTask(...args));
    }
  }, [tasks, addTask, editTask]);

  useEffect(() => {
    handleRecurringTasks();
  }, [handleRecurringTasks]);

  const todayTasks = useMemo(() => {
    return tasks
        .filter(task => task.deadline && isToday(new Date(task.deadline)))
        .sort((a,b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }, [tasks]);

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <Header />
      <main className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <ListTodo className='h-6 w-6 text-primary' />
                    <span>Checklist de Hoje</span>
                </CardTitle>
                <CardDescription>
                    Todas as suas tarefas agendadas para hoje em um só lugar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {todayTasks.length > 0 ? (
                    <div className="space-y-2">
                        {todayTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-card p-12 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <ListTodo className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold text-card-foreground">
                            Nenhuma tarefa para hoje
                        </h2>
                        <p className="mt-2 max-w-sm text-center text-muted-foreground">
                            Você não tem tarefas agendadas para hoje. Que tal adicionar algumas ou voltar para a página principal?
                        </p>
                        <Link href="/" passHref>
                            <Button className="mt-6">
                                <Home className="mr-2 h-4 w-4" />
                                Voltar ao Início
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
