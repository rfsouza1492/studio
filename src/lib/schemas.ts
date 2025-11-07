
import { z } from "zod";
import { priorities, recurrences } from "@/app/types";

export const goalBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  kpiName: z.string().optional(),
  kpiTarget: z.coerce.number().optional(),
  kpiCurrent: z.coerce.number().optional(),
  userId: z.string(),
});

export const taskBaseSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  priority: z.enum(priorities),
  deadline: z.string().optional(),
  recurrence: z.enum(recurrences),
  duration: z.coerce.number().optional(),
  userId: z.string(),
});

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }),
  priority: z.enum(priorities),
  deadline: z.date().optional(),
  time: z.string().optional(),
  recurrence: z.enum(recurrences),
  duration: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
}).refine(data => {
    if (data.deadline && data.time) {
        const combined = new Date(data.deadline);
        const [hours, minutes] = data.time.split(':').map(Number);
        combined.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0 for accurate comparison
        return combined > new Date();
    }
    if (data.deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(data.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate >= today;
    }
    return true;
}, {
    message: "Deadline cannot be in the past.",
    path: ["time"], // Point error to time field for better UX
});

export const goalSchema = z.object({
  name: z.string().min(1, { message: "Goal name cannot be empty." }),
  kpiName: z.string().optional(),
  kpiCurrent: z.coerce.number().min(0).optional(),
  kpiTarget: z.coerce.number().min(0).optional(),
}).refine(data => {
    if (data.kpiTarget !== undefined && data.kpiCurrent !== undefined) {
        return data.kpiCurrent <= data.kpiTarget;
    }
    return true;
}, {
    message: "Current value cannot be greater than target value.",
    path: ["kpiCurrent"],
});


// Agent related schemas
export const AgentInputSchema = z.object({
  query: z.string(),
  context: z.object({
    goals: z.array(goalBaseSchema),
    tasks: z.array(taskBaseSchema),
  }),
});

export const AgentOutputSchema = z.object({
  message: z.string(),
});
