import { z } from "zod";
import { priorities } from "@/app/types";

export const goalSchema = z.object({
  name: z.string().min(1, { message: "Goal name cannot be empty." }),
});

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }),
  priority: z.enum(priorities),
  deadline: z.date().optional(),
}).refine(data => {
    if (data.deadline) {
        // Set time to 00:00:00 to compare dates only
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
