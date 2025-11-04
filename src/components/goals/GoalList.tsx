"use client";
import { useGoals } from '@/context/GoalContext';
import { GoalCard } from './GoalCard';

export function GoalList() {
  const { goals } = useGoals();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
