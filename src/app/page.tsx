
'use client';
import { GoalList } from '@/components/goals/GoalList';
import { Header } from '@/components/layout/Header';
import { useGoals } from '@/context/GoalContext';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';

export default function Home() {
  const { goals } = useGoals();
  
  useEffect(() => {
    // Clear the flag for initial data loading to allow users to reset if they want.
    const hasBeenLoaded = localStorage.getItem('goalFlowInitialDataLoaded');
    if(hasBeenLoaded) {
      // If the user wants to clear data, they can do so by clearing localStorage
      // and reloading. This logic just prevents re-seeding.
    }
  }, []);


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
