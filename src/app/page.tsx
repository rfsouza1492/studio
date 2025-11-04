
'use client';
import { GoalList } from '@/components/goals/GoalList';
import { Header } from '@/components/layout/Header';
import { useGoals } from '@/context/GoalContext';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';

export default function Home() {
  const { goals, dispatch } = useGoals();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasBeenInitialized = localStorage.getItem('goalFlowInitialized');
      if (!hasBeenInitialized && dispatch) {
        const initialState = {
          goals: [
            { id: 'goal-1', name: 'Desenvolvimento pessoal — Ser referência em dados e IA' },
            { id: 'goal-2', name: 'Estilo de vida saudável' },
            { id: 'goal-3', name: 'Rotina e planejamento' },
          ],
          tasks: [
            { id: 'task-1', goalId: 'goal-1', title: '19:00–20:00 Estudo focado (Node.js / HubSpot / SQL)', completed: false, priority: 'High', recurrence: 'Daily' },
            { id: 'task-2', goalId: 'goal-2', title: '06:00–07:00 Treino (Bike/Corrida)', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-3', goalId: 'goal-2', title: '07:20–07:40 Yoga', completed: false, priority: 'Low', recurrence: 'None' },
            { id: 'task-4', goalId: 'goal-2', title: '07:40–07:55 Meditação', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-5', goalId: 'goal-2', title: '08:00 Café da manhã', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-6', goalId: 'goal-2', title: '10:30 Lanche da manhã', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-7', goalId: 'goal-2', title: '16:00 Lanche da tarde', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-8', goalId: 'goal-2', title: '20:30 Jantar', completed: false, priority: 'Medium', recurrence: 'None' },
            { id: 'task-9', goalId: 'goal-2', title: '07:00–07:20 Passear com o Woody', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-10', goalId: 'goal-3', title: '11:00 Reunião weekly sync', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-11', goalId: 'goal-3', title: '12:30 Almoço', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-12', goalId: 'goal-3', title: '17:30–18:00 Encerramento do dia', completed: true, priority: 'Medium', recurrence: 'None' },
            { id: 'task-13', goalId: 'goal-3', title: '18:00–18:15 Planejar amanhã (3 itens)', completed: true, priority: 'Medium', recurrence: 'None' },
          ]
        };
        dispatch({ type: 'SET_STATE', payload: initialState });
        localStorage.setItem('goalFlowInitialized', 'true');
      }
    }
  }, [dispatch]);


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

