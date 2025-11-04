
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
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
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
      time: task?.deadline ? format(new Date(task.deadline), 'HH:mm') : "09:00",
      duration: task?.duration || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        priority: task?.priority || "Medium",
        deadline: task?.deadline ? new Date(task.deadline) : undefined,
        recurrence: task?.recurrence || 'None',
        time: task?.deadline ? format(new Date(task.deadline), 'HH:mm') : "09:00",
        duration: task?.duration || '',
      });
    }
  }, [open, task, form]);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    let combinedDeadline: Date | undefined = undefined;
    if (values.deadline) {
        combinedDeadline = new Date(values.deadline);
        const [hours, minutes] = values.time?.split(':').map(Number) || [0, 0];
        combinedDeadline.setHours(hours, minutes);
    }
    
    const durationValue = values.duration ? Number(values.duration) : undefined;

    if (isEditMode) {
      editTask({ ...task!, ...values, deadline: combinedDeadline?.toISOString(), duration: durationValue });
      toast({ title: "Tarefa Atualizada", description: "Sua tarefa foi atualizada." });
    } else {
      addTask(goalId, values.title, values.priority, values.recurrence, combinedDeadline, durationValue);
      toast({ title: "Tarefa Adicionada", description: "Uma nova tarefa foi adicionada à sua meta." });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Atualize os detalhes da sua tarefa." : "Qual é o próximo passo para alcançar sua meta?"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Tarefa</FormLabel>
                  <FormControl>
                    <Input id="title" placeholder="ex: Completar o tutorial" {...field} />
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
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
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
                    <FormLabel>Recorrência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Entrega</FormLabel>
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
                                <span>Escolha uma data</span>
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
                 <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hora da Entrega</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duração (minutos)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="ex: 30" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar Tarefa'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
