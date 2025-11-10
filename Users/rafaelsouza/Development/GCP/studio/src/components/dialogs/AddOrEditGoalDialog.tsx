
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
        name: values.name,
        id: goal?.id || '',
        kpiName: values.kpiName,
        kpiCurrent: values.kpiCurrent,
        kpiTarget: values.kpiTarget,
    };

    if (isEditMode) {
      editGoal(goalData);
      toast({ title: "Meta Atualizada", description: `A meta "${values.name}" foi atualizada.` });
    } else {
      // The addGoal function in the context will handle converting undefined to null
      addGoal(goalData);
      toast({ title: "Meta Criada", description: `A meta "${values.name}" foi criada.` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Meta' : 'Criar Nova Meta'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Atualize sua meta e seu KPI." : "Defina sua meta e um KPI para acompanhar o progresso."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Aprender Next.js" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <h4 className="text-sm font-medium">Indicador-Chave de Performance (KPI)</h4>
             <FormField
              control={form.control}
              name="kpiName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do KPI (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Páginas Lidas, Km Corridos" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Valor Atual</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Valor Alvo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Criar Meta'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    