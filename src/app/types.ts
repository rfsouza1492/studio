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

// Agent related schemas
const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  kpiName: z.string().optional(),
  kpiTarget: z.number().optional(),
  kpiCurrent: z.number().optional(),
});

const TaskSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  priority: z.enum(["Low", "Medium", "High"]),
  deadline: z.string().optional(),
  recurrence: z.enum(["None", "Daily", "Weekly", "Monthly"]),
  duration: z.number().optional(),
});

export const AgentInputSchema = z.object({
  query: z.string().describe('A pergunta ou comando do usuário.'),
  context: z.object({
    goals: z.array(GoalSchema),
    tasks: z.array(TaskSchema),
  }).describe('O estado atual das metas e tarefas do usuário.'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const AgentOutputSchema = z.object({
  textResponse: z.string().describe('A resposta em texto para o usuário.'),
  audioResponse: z.string().optional().describe('A resposta em áudio (data URI base64) para o usuário.'),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;