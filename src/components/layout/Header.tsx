"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';

export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">GoalFlow</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="-ml-1 h-5 w-5" />
          <span>New Goal</span>
        </Button>
      </header>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
