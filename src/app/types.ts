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
  deadline?: string;
  recurrence: Recurrence;
  duration?: number; // in minutes
}

export interface Goal {
  id: string;
  name: string;
  kpiName?: string;
  kpiTarget?: number;
  kpiCurrent?: number;
}


// Agent related types
export interface AgentInput {
  query: string;
  context: {
    goals: Goal[];
    tasks: Task[];
  };
}

export interface AgentOutput {
  message: string;
}
