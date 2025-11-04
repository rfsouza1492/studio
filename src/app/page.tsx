
'use client';
import { GoalList } from '@/components/goals/GoalList';
import { Header } from '@/components/layout/Header';
import { useGoals } from '@/context/GoalContext';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';

// Helper to create a date object for a specific date with a specific time
const createDate = (hours: number, minutes: number) => {
  const date = new Date(2024, 10, 3); // November 3, 2024
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper to create a date object for the next day with a specific time
const createTomorrowDate = (hours: number, minutes: number) => {
    const date = new Date(2024, 10, 4); // November 4, 2024
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const initialData = {
    today: [
        { time: [10,30], duration: 15, title: 'Continuar desenho do processo de onboarding', completed: true },
        { time: [11,0], duration: 30, title: 'Reunião weekly sync', completed: true },
        { time: [12,30], duration: 30, title: 'Almoço', completed: true },
        { time: [13,0], duration: 90, title: 'Task da Yuca', completed: true },
        { time: [14,30], duration: 90, title: 'Analisar ICP — Clube da Fala', completed: true },
        { time: [16,0], duration: 30, title: 'Reunião com Yuca', completed: true },
        { time: [16,0], duration: 15, title: 'Lanche da tarde', completed: true },
        { time: [17,0], duration: 30, title: 'Reunião com Clube da Fala', completed: true },
        { time: [17,30], duration: 30, title: 'Encerramento do dia', completed: true },
        { time: [18,0], duration: 15, title: 'Planejar amanhã (3 itens)', completed: true },
        { time: [19,0], duration: 60, title: 'Estudo focado (Node.js / HubSpot / SQL)', completed: false },
        { time: [20,30], duration: 30, title: 'Jantar', completed: false },
        { time: [6,0], duration: 60, title: 'Treino (Bike/Corrida)', completed: true },
        { time: [7,0], duration: 20, title: 'Passear com o Woody', completed: true },
        { time: [7,20], duration: 20, title: 'Yoga', completed: false },
        { time: [7,40], duration: 15, title: 'Meditação', completed: true },
        { time: [8,0], duration: 30, title: 'Café da manhã', completed: true },
        { time: [8,30], duration: 25, title: 'Pomodoro - Manhã: Foco 1 - Curso', completed: true },
        { time: [8,55], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: true },
        { time: [9,0], duration: 25, title: 'Pomodoro - Manhã: Foco 2 - Chipe a organizar dia', completed: true },
        { time: [9,25], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: true },
        { time: [9,30], duration: 25, title: 'Pomodoro - Manhã: Foco 3', completed: true },
        { time: [9,55], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: true },
        { time: [10,0], duration: 25, title: 'Pomodoro - Manhã: Foco 4', completed: true },
        { time: [10,25], duration: 5, title: 'Pomodoro - Manhã: Pausa longa', completed: true },
        { time: [10,30], duration: 15, title: 'Lanche da manhã', completed: true },
        { time: [10,45], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 1', completed: false },
        { time: [11,10], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [11,15], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 2', completed: false },
        { time: [11,40], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [11,45], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 3', completed: false },
        { time: [12,10], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [13,30], duration: 25, title: 'Pomodoro - Tarde: Foco 1', completed: false },
        { time: [13,55], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [14,0], duration: 25, title: 'Pomodoro - Tarde: Foco 2', completed: false },
        { time: [14,25], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [14,30], duration: 25, title: 'Pomodoro - Tarde: Foco 3', completed: false },
        { time: [14,55], duration: 15, title: 'Pomodoro - Tarde: Pausa longa', completed: false },
        { time: [15,10], duration: 25, title: 'Pomodoro - Tarde: Foco 4', completed: false },
        { time: [15,35], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [15,40], duration: 25, title: 'Pomodoro - Tarde: Foco 5', completed: false },
        { time: [16,5], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [16,10], duration: 25, title: 'Pomodoro - Tarde: Foco 6', completed: false },
        { time: [16,35], duration: 15, title: 'Pomodoro - Tarde: Pausa longa', completed: false },
    ],
    tomorrow: [
        { time: [6,0], duration: 60, title: 'Treino (Bike/Corrida)', completed: false },
        { time: [7,0], duration: 20, title: 'Passear com o Woody', completed: true },
        { time: [7,20], duration: 20, title: 'Yoga', completed: false },
        { time: [7,40], duration: 15, title: 'Meditação', completed: false },
        { time: [7,55], duration: 30, title: 'Leitura técnica', completed: true },
        { time: [8,0], duration: 30, title: 'Café da manhã', completed: false },
        { time: [8,30], duration: 25, title: 'Pomodoro - Manhã: Foco 1', completed: false },
        { time: [8,55], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: false },
        { time: [9,0], duration: 25, title: 'Pomodoro - Manhã: Foco 2', completed: false },
        { time: [9,25], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: false },
        { time: [9,30], duration: 25, title: 'Pomodoro - Manhã: Foco 3', completed: false },
        { time: [9,55], duration: 5, title: 'Pomodoro - Manhã: Pausa', completed: false },
        { time: [10,0], duration: 25, title: 'Pomodoro - Manhã: Foco 4', completed: false },
        { time: [10,25], duration: 5, title: 'Pomodoro - Manhã: Pausa longa', completed: false },
        { time: [10,30], duration: 15, title: 'Lanche da manhã', completed: false },
        { time: [10,45], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 1', completed: false },
        { time: [11,10], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [11,15], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 2', completed: false },
        { time: [11,40], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [11,45], duration: 25, title: 'Pomodoro - Meio‑dia: Foco 3', completed: false },
        { time: [12,10], duration: 5, title: 'Pomodoro - Meio‑dia: Pausa', completed: false },
        { time: [12,30], duration: 60, title: 'Almoço', completed: false },
        { time: [13,30], duration: 25, title: 'Pomodoro - Tarde: Foco 1', completed: false },
        { time: [13,55], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [14,0], duration: 25, title: 'Pomodoro - Tarde: Foco 2', completed: false },
        { time: [14,25], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [14,30], duration: 25, title: 'Pomodoro - Tarde: Foco 3', completed: false },
        { time: [14,55], duration: 15, title: 'Pomodoro - Tarde: Pausa longa', completed: false },
        { time: [15,10], duration: 25, title: 'Pomodoro - Tarde: Foco 4', completed: false },
        { time: [15,35], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [15,40], duration: 25, title: 'Pomodoro - Tarde: Foco 5', completed: false },
        { time: [16,5], duration: 5, title: 'Pomodoro - Tarde: Pausa', completed: false },
        { time: [16,10], duration: 25, title: 'Pomodoro - Tarde: Foco 6', completed: false },
        { time: [16,35], duration: 15, title: 'Pomodoro - Tarde: Pausa longa', completed: false },
        { time: [16,0], duration: 15, title: 'Lanche da tarde', completed: false },
        { time: [17,30], duration: 30, title: 'Encerramento do dia', completed: false },
        { time: [18,0], duration: 15, title: 'Planejar amanhã (3 itens)', completed: false },
        { time: [19,0], duration: 60, title: 'Estudo focado (Node.js / HubSpot / SQL)', completed: false },
        { time: [20,30], duration: 30, title: 'Jantar', completed: false },
    ]
}


export default function Home() {
  const { goals, addGoal, addTask } = useGoals();

  useEffect(() => {
    // This effect runs once on mount to ensure initial data is loaded
    // if the local storage is empty.
    const hasBeenLoaded = localStorage.getItem('goalFlowInitialDataLoaded');
    if (!hasBeenLoaded) {
      const todayGoalName = 'Agenda de Hoje';
      const tomorrowGoalName = 'Agenda de Amanhã';
      
      addGoal({ name: todayGoalName });
      addGoal({ name: tomorrowGoalName });

      // The logic to add tasks will be triggered in the next effect
      // once the goals are in the state.
      
      localStorage.setItem('goalFlowInitialDataLoaded', 'true');
    }
  }, [addGoal]);


  useEffect(() => {
      const todayGoal = goals.find(g => g.name === 'Agenda de Hoje');
      const tomorrowGoal = goals.find(g => g.name === 'Agenda de Amanhã');
      
      // Check if goals exist and if tasks for them have already been added.
      // This is a simple check; a more robust solution would track added tasks by goal ID.
      const areTodayTasksMissing = todayGoal && goals.find(g => g.id === todayGoal.id) && !initialData.today.some(t => t.title.includes('Reunião weekly sync'));
      const areTomorrowTasksMissing = tomorrowGoal && goals.find(g => g.id === tomorrowGoal.id) && !initialData.tomorrow.some(t => t.title.includes('Passear com o Woody'));

      if (todayGoal && areTodayTasksMissing) {
        initialData.today.forEach(task => {
          addTask(
            todayGoal.id,
            task.title,
            'Medium',
            'None',
            createDate(task.time[0], task.time[1]),
            task.duration,
            task.completed
          );
        });
      }
      
      if (tomorrowGoal && areTomorrowTasksMissing) {
        initialData.tomorrow.forEach(task => {
           addTask(
            tomorrowGoal.id,
            task.title,
            'Medium',
            'None',
            createTomorrowDate(task.time[0], task.time[1]),
            task.duration,
            task.completed
          );
        });
      }
  }, [goals, addTask])


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
          Create Your First Goal
        </h2>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Welcome to GoalFlow! Get started by creating a new goal and breaking
          it down into manageable tasks.
        </p>
        <Button className="mt-6" onClick={() => setDialogOpen(true)}>
          Create a Goal
        </Button>
      </div>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
