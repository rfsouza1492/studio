import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, differenceInHours, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeadlineStatus(deadline: string | undefined) {
  if (!deadline) {
    return { label: 'No deadline', color: 'text-gray-500', icon: 'Minus' as const };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);

  const hoursRemaining = differenceInHours(deadlineDate, now);
  const daysRemaining = differenceInDays(deadlineDate, now);

  if (hoursRemaining < 0) {
    return { label: `Overdue`, color: 'text-red-600 font-bold', icon: 'XCircle' as const };
  }
  if (hoursRemaining < 72) { // Less than 3 days
    return { label: `Due in ${hoursRemaining} hour(s)`, color: 'text-red-500', icon: 'AlertCircle' as const };
  }
  if (daysRemaining <= 7) {
    return { label: `Due in ${daysRemaining} day(s)`, color: 'text-yellow-500', icon: 'Clock' as const };
  }
  return { label: `Due in ${daysRemaining} days`, color: 'text-green-500', icon: 'CheckCircle2' as const };
}
