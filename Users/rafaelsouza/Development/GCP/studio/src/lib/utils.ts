import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, differenceInHours } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type DeadlineStatusIcon = 'XCircle' | 'AlertCircle' | 'Clock' | 'CheckCircle2' | 'Minus';

export interface DeadlineStatus {
  label: string;
  color: string;
  icon: DeadlineStatusIcon;
}

export function getDeadlineStatus(deadline: string | undefined | null): DeadlineStatus {
  if (!deadline) {
    return { label: 'Sem prazo', color: 'text-gray-500', icon: 'Minus' };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);

  const hoursRemaining = differenceInHours(deadlineDate, now);
  
  if (hoursRemaining < 0) {
    return { label: `Atrasada`, color: 'text-red-600 font-bold', icon: 'XCircle' };
  }
  
  if (hoursRemaining < 24) {
    return { label: `Vence em ${hoursRemaining} hora(s)`, color: 'text-red-500', icon: 'AlertCircle' };
  }

  const daysRemaining = differenceInDays(deadlineDate, now);
  
  if (daysRemaining <= 7) {
    return { label: `Vence em ${daysRemaining} dia(s)`, color: 'text-yellow-500', icon: 'Clock' };
  }

  return { label: `Vence em ${daysRemaining} dias`, color: 'text-green-500', icon: 'CheckCircle2' };
}
