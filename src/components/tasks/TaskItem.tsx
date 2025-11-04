
"use client";
import React from 'react';
import { Task } from '@/app/types';
import { useGoals } from '@/context/GoalContext';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ChevronUp, ChevronsUp, ChevronDown, XCircle, AlertCircle, Clock, CheckCircle2, Minus, Repeat, Timer, CalendarPlus } from 'lucide-react';
import { cn, getDeadlineStatus } from '@/lib/utils';
import { AddOrEditTaskDialog } from '../dialogs/AddOrEditTaskDialog';
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { format } from 'date-fns';
import { useGoogleApi } from '@/context/GoogleApiContext';
import { useToast } from '@/hooks/use-toast';

const priorityConfig = {
  High: { icon: ChevronsUp, color: 'text-red-500' },
  Medium: { icon: ChevronUp, color: 'text-yellow-500' },
  Low: { icon: ChevronDown, color: 'text-green-500' },
};

const deadlineIcons = {
  XCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Minus,
};

export function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useGoals();
  const { isSignedIn, createEvent } = useGoogleApi();
  const { toast } = useToast();
  const [editTaskOpen, setEditTaskOpen] = React.useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = React.useState(false);

  const PriorityIcon = priorityConfig[task.priority]?.icon || ChevronDown;
  const priorityColor = priorityConfig[task.priority]?.color || 'text-muted-foreground';

  const deadlineStatus = getDeadlineStatus(task.deadline);
  const DeadlineIcon = deadlineIcons[deadlineStatus.icon];

  const handleCreateEvent = () => {
    if (!isSignedIn) {
        toast({
            variant: "destructive",
            title: 'Não conectado',
            description: `Você precisa conectar sua conta do Google para criar um evento.`,
        });
        return;
    }
    if(!task.deadline || !task.duration) {
         toast({
            variant: "destructive",
            title: 'Dados Incompletos',
            description: `A tarefa precisa de uma data de entrega e duração para ser adicionada à agenda.`,
        });
        return;
    }

    createEvent(task.title, new Date(task.deadline), task.duration);
    toast({
      title: 'Evento Criado no Google Calendar',
      description: `O evento "${task.title}" foi adicionado à sua agenda.`,
    });
  };

  return (
    <>
      <div className="group flex items-center justify-between rounded-md bg-background p-2 pr-1 transition-colors hover:bg-accent">
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            aria-label={`Marcar tarefa ${task.title} como ${task.completed ? 'incompleta' : 'completa'}`}
          />
           <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("cursor-default", priorityColor)}>
                    <PriorityIcon className="h-4 w-4 flex-shrink-0" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prioridade {task.priority}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <label
              htmlFor={`task-${task.id}`}
              className={cn("truncate text-sm transition-colors", task.completed && "text-muted-foreground line-through")}
            >
              {task.title}
            </label>
           </div>
        </div>

        <div className='flex items-center gap-2'>
        {task.deadline && task.duration && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCreateEvent}>
                  <CalendarPlus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar ao Google Calendar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {task.duration && task.duration > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>{task.duration} min</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duração estimada: {task.duration} minutos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {task.recurrence !== 'None' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Recorre {task.recurrence.toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {task.deadline && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn("flex items-center gap-1 text-xs", deadlineStatus.color)}>
                    <DeadlineIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{format(new Date(task.deadline), "dd MMM, p")}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deadlineStatus.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditTaskOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteTaskOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Deletar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AddOrEditTaskDialog open={editTaskOpen} onOpenChange={setEditTaskOpen} task={task} goalId={task.goalId} />
      <DeleteConfirmationDialog
        open={deleteTaskOpen}
        onOpenChange={setDeleteTaskOpen}
        onConfirm={() => deleteTask(task.id)}
        title="Deletar Tarefa"
        description={`Você tem certeza que quer deletar a tarefa "${task.title}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
}
