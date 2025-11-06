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
  query: z.string().describe('The user\'s question or command.'),
  context: z.object({
    goals: z.array(GoalSchema),
    tasks: z.array(TaskSchema),
  }).describe('The current state of the user\'s goals and tasks.'),
  mode: z.enum(['chat', 'goal_coach']).default('chat'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;


const TaskSuggestionSchema = z.object({
  title: z.string().describe("Specific task"),
  priority: z.enum(priorities),
  duration: z.number().optional().describe("Duration in minutes"),
  recurrence: z.enum(recurrences).optional().describe("Task frequency"),
});
export type TaskSuggestion = z.infer<typeof TaskSuggestionSchema>;


export const GoalSuggestionSchema = z.object({
  goalName: z.string().describe("Name of the SMART goal"),
  kpiName: z.string().optional().describe("Measurable metric (optional)"),
  tasks: z.array(TaskSuggestionSchema),
});
export type GoalSuggestion = z.infer<typeof GoalSuggestionSchema>;


export const AgentOutputSchema = z.object({
  message: z.string().describe('The conversational response to the user.'),
  suggestions: z.array(GoalSuggestionSchema).optional().describe('A list of suggested goals and tasks.'),
  action: z.enum(['create_goals', 'clarify', 'answer']).optional().describe('The action the agent is performing.'),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;
