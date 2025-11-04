export const priorities = ["Low", "Medium", "High"] as const;

export type Priority = (typeof priorities)[number];

export interface Task {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  priority: Priority;
  deadline?: string;
}

export interface Goal {
  id: string;
  name: string;
}
