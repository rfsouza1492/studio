import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeadlineStatus(deadline: string | undefined) {
  if (!deadline) {
    return { label: 'No deadline', color: 'text-gray-500', icon: 'Minus' as const };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysRemaining = differenceInDays(deadlineDate, today);

  if (daysRemaining < 0) {
    return { label: `Overdue by ${Math.abs(daysRemaining)} day(s)`, color: 'text-red-600 font-bold', icon: 'XCircle' as const };
  }
  if (daysRemaining < 3) {
    return { label: `Due in ${daysRemaining} day(s)`, color: 'text-red-500', icon: 'AlertCircle' as const };
  }
  if (daysRemaining <= 7) {
    return { label: `Due in ${daysRemaining} days`, color: 'text-yellow-500', icon: 'Clock' as const };
  }
  return { label: `Due in ${daysRemaining} days`, color: 'text-green-500', icon: 'CheckCircle2' as const };
}
