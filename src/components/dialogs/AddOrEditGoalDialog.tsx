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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { goalSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

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
      kpiName: goal?.kpiName || "",
      kpiCurrent: goal?.kpiCurrent || 0,
      kpiTarget: goal?.kpiTarget || 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: goal?.name || "",
        kpiName: goal?.kpiName || "",
        kpiCurrent: goal?.kpiCurrent || 0,
        kpiTarget: goal?.kpiTarget || 0,
      });
    }
  }, [open, goal, form]);

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const goalData = {
        ...values,
        kpiName: values.kpiName || undefined,
        kpiCurrent: values.kpiCurrent,
        kpiTarget: values.kpiTarget,
    };

    if (isEditMode) {
      editGoal({ ...goal, ...goalData });
      toast({ title: "Goal Updated", description: `The goal "${values.name}" has been updated.` });
    } else {
      addGoal(goalData);
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
            {isEditMode ? "Update your goal and its KPI." : "Define your goal and set a KPI to track progress."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Learn Next.js" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <h4 className="text-sm font-medium">Key Performance Indicator (KPI)</h4>
             <FormField
              control={form.control}
              name="kpiName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pages Read, Km Ran" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="kpiCurrent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="kpiTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
