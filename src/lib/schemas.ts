import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, { message: "Goal name cannot be empty." }),
});

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }),
});
