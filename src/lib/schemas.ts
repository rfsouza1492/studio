
import { z } from "zod";
import { priorities, recurrences } from "@/app/types";

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
        combined.setHours(hours, minutes);
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
    path: ["deadline"],
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
