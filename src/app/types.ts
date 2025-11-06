
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
  priority: z.enum(priorities),
  deadline: z.string().optional(),
  recurrence: z.enum(recurrences),
  duration: z.number().optional(),
});

export const AgentInputSchema = z.object({
  query: z.string().describe('A pergunta ou comando do usuário.'),
  context: z.object({
    goals: z.array(GoalSchema),
    tasks: z.array(TaskSchema),
  }).describe('O estado atual das metas e tarefas do usuário.'),
  mode: z.enum(['chat', 'goal_coach']).default('chat'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;


const TaskSuggestionSchema = z.object({
  title: z.string().describe("Tarefa específica"),
  priority: z.enum(priorities),
  duration: z.number().optional().describe("Duração em minutos"),
  recurrence: z.enum(recurrences).optional().describe("Frequência da tarefa"),
});
export type TaskSuggestion = z.infer<typeof TaskSuggestionSchema>;


export const GoalSuggestionSchema = z.object({
  goalName: z.string().describe("Nome da meta SMART"),
  kpiName: z.string().optional().describe("Métrica mensurável (opcional)"),
  tasks: z.array(TaskSuggestionSchema),
});
export type GoalSuggestion = z.infer<typeof GoalSuggestionSchema>;


export const AgentOutputSchema = z.object({
  message: z.string().describe('A resposta conversacional para o usuário.'),
  suggestions: z.array(GoalSuggestionSchema).optional().describe('Uma lista de metas e tarefas sugeridas.'),
  action: z.enum(['create_goals', 'clarify', 'answer']).optional().describe('A ação que o agente está realizando.'),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;
