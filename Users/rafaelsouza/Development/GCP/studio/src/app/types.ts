
import { z } from "zod";

export const priorities = ["Low", "Medium", "High"] as const;
export const recurrences = ["None", "Daily", "Weekly", "Monthly"] as const;

export type Priority = (typeof priorities)[number];
export type Recurrence = (typeof recurrences)[number];

export interface Task {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  priority: Priority;
  deadline?: string | null;
  recurrence: Recurrence;
  duration?: number | null; // in minutes
  userId: string;
}

export interface Goal {
  id: string;
  name: string;
  kpiName?: string | null;
  kpiTarget?: number | null;
  kpiCurrent?: number | null;
  userId: string;
}

    