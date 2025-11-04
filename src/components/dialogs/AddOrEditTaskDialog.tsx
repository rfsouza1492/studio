"use client";

import React, { useEffect } from 'react';
import { Task, priorities } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { taskSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddOrEditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  task?: Task;
}

export function AddOrEditTaskDialog({ open, onOpenChange, goalId, task }: AddOrEditTaskDialogProps) {
  const { addTask, editTask } = useGoals();
  const { toast } = useToast();
  const isEditMode = !!task;

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      priority: task?.priority || "Medium",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        priority: task?.priority || "Medium",
      });
    }
  }, [open, task, form]);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (isEditMode) {
      editTask({ ...task, title: values.title, priority: values.priority });
      toast({ title: "Task Updated", description: "Your task has been updated." });
    } else {
      addTask(goalId, values.title, values.priority);
      toast({ title: "Task Added", description: "A new task has been added to your goal." });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your task." : "What's the next step to reach your goal?"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label>Task Title</Label>
                  <FormControl>
                    <Input id="title" placeholder="e.g., Complete tutorial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <Label>Priority</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Task'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
