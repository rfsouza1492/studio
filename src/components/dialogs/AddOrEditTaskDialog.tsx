"use client";

import React, { useEffect } from 'react';
import { Task, priorities, recurrences } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { taskSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

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
      deadline: task?.deadline ? new Date(task.deadline) : undefined,
      recurrence: task?.recurrence || 'None',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        priority: task?.priority || "Medium",
        deadline: task?.deadline ? new Date(task.deadline) : undefined,
        recurrence: task?.recurrence || 'None',
      });
    }
  }, [open, task, form]);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (isEditMode) {
      editTask({ ...task, ...values, deadline: values.deadline?.toISOString() });
      toast({ title: "Task Updated", description: "Your task has been updated." });
    } else {
      addTask(goalId, values.title, values.priority, values.recurrence, values.deadline);
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
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <Label>Recurrence</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recurrences.map(rec => (
                          <SelectItem key={rec} value={rec}>{rec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                           const today = new Date();
                           today.setHours(0,0,0,0);
                           return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
