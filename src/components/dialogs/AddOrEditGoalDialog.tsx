"use client";

import React, { useEffect } from 'react';
import { Goal } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { goalSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

interface AddOrEditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

export function AddOrEditGoalDialog({ open, onOpenChange, goal }: AddOrEditGoalDialogProps) {
  const { addGoal, editGoal } = useGoals();
  const { toast } = useToast();
  const isEditMode = !!goal;

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: goal?.name || "" });
    }
  }, [open, goal, form]);

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    if (isEditMode) {
      editGoal({ ...goal, name: values.name });
      toast({ title: "Goal Updated", description: `The goal "${values.name}" has been updated.` });
    } else {
      addGoal(values.name);
      toast({ title: "Goal Created", description: `The goal "${values.name}" has been created.` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the name of your goal." : "What's the next big thing you want to achieve?"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name" className="sr-only">Goal Name</Label>
                  <FormControl>
                    <Input id="name" placeholder="e.g., Learn Next.js" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
