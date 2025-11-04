
'use client';
import { GoalList } from '@/components/goals/GoalList';
import { Header } from '@/components/layout/Header';
import { useGoals } from '@/context/GoalContext';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
import { add, set } from 'date-fns';

const initialData = {
    today: [
        { time: [6,0], duration: 60, title: 'Treino (Bike/Corrida)', completed: true },
        { time: [7,0], duration: 20, title: 'Passear com o Woody', completed: true },
        { time: [7,20], duration: 20, title: 'Yoga', completed: true },
        { time: [7,40], duration: 15, title: 'Meditação', completed: true },
        { time: [8,0], duration: 30, title: 'Café da manhã', completed: true },
        { time: [8,30], duration: 25, title: 'Pomodoro 1: Planejar o dia', completed: true },
        { time: [9,0], duration: 25, title: 'Pomodoro 2: Revisar e-mails importantes', completed: true },
        { time: [10,0], duration: 60, title: 'Reunião de Sincronização Semanal', completed: true },
        { time: [11,0], duration: 25, title: 'Pomodoro 3: Foco em tarefa principal', completed: true },
        { time: [12,30], duration: 60, title: 'Almoço', completed: false },
        { time: [14,0], duration: 90, title: 'Desenvolver funcionalidade X', completed: false },
        { time: [16,0], duration: 30, title: 'Reunião com cliente Y', completed: false },
        { time: [17,30], duration: 30, title: 'Encerramento do dia e revisão', completed: false },
        { time: [19,0], duration: 60, title: 'Estudo focado (Node.js)', completed: false },
    ],
    tomorrow: [
        { time: [6,0], duration: 60, title: 'Treino (Corrida leve)', completed: false },
        { time: [7,0], duration: 20, title: 'Passear com o Woody', completed: false },
        { time: [8,0], duration: 30, title: 'Café da manhã e leitura de notícias', completed: false },
        { time: [9,0], duration: 90, title: 'Preparar apresentação para sexta-feira', completed: false },
        { time: [11,0], duration: 60, title: 'Reunião de alinhamento de projeto', completed: false },
        { time: [12,30], duration: 60, title: 'Almoço', completed: false },
        { time: [14,0], duration: 120, title: 'Bloco de codificação focado', completed: false },
        { time: [16,30], duration: 30, title: 'Responder e-mails e mensagens', completed: false },
        { time: [17,30], duration: 15, title: 'Planejar o próximo dia', completed: false },
    ]
};

// Helper to create a date object for a specific date with a specific time
const createDateWithTime = (baseDate: Date, hours: number, minutes: number) => {
  return set(baseDate, { hours, minutes, seconds: 0, milliseconds: 0 });
};

export default function Home() {
  const { goals, tasks, addGoal, addTask } = useGoals();

  useEffect(() => {
    // This effect runs once on mount to ensure initial data is loaded
    // if the local storage is empty.
    const hasBeenLoaded = localStorage.getItem('goalFlowInitialDataLoaded');
    if (!hasBeenLoaded) {
      console.log('No initial data found. Loading sample data...');
      const todayGoalName = 'Rotina de Hoje';
      const tomorrowGoalName = 'Planejamento de Amanhã';
      
      const todayGoalId = crypto.randomUUID();
      const tomorrowGoalId = crypto.randomUUID();

      // Add goals first
      addGoal({ id: todayGoalId, name: todayGoalName });
      addGoal({ id: tomorrowGoalId, name: tomorrowGoalName });

      const today = new Date();
      const tomorrow = add(today, { days: 1 });

      // Add tasks for today
      initialData.today.forEach(taskData => {
        addTask(
          todayGoalId,
          taskData.title,
          'Medium',
          'None',
          createDateWithTime(today, taskData.time[0], taskData.time[1]),
          taskData.duration,
          taskData.completed
        );
      });

      // Add tasks for tomorrow
      initialData.tomorrow.forEach(taskData => {
        addTask(
          tomorrowGoalId,
          taskData.title,
          'Medium',
          'None',
          createDateWithTime(tomorrow, taskData.time[0], taskData.time[1]),
          taskData.duration,
          taskData.completed
        );
      });
      
      localStorage.setItem('goalFlowInitialDataLoaded', 'true');
    }
  }, [addGoal, addTask]);


  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <Header />
      <main className="mt-8">
        {goals.length > 0 ? <GoalList /> : <EmptyState />}
      </main>
    </div>
  );
}

function EmptyState() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-card p-12 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-card-foreground">
          Crie Sua Primeira Meta
        </h2>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Bem-vindo ao GoalFlow! Comece criando uma nova meta e dividindo-a
          em tarefas gerenciáveis.
        </p>
        <Button className="mt-6" onClick={() => setDialogOpen(true)}>
          Criar uma Meta
        </Button>
      </div>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
