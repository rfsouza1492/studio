
import type { Goal, Task } from '@/app/types';

export interface State {
  goals: Goal[];
  tasks: Task[];
}

const goals: Goal[] = [
  { id: 'goal-1', name: 'Aprender Next.js', kpiName: 'Módulos', kpiCurrent: 3, kpiTarget: 10 },
  { id: 'goal-2', name: 'Criar um App de Receitas', kpiName: 'Receitas', kpiCurrent: 5, kpiTarget: 20 },
  { id: 'goal-3', name: 'Correr 5km' },
];

const tasks: Task[] = [
  // Next.js
  { id: 'task-1', goalId: 'goal-1', title: 'Completar o tutorial básico', completed: true, priority: 'High', recurrence: 'None', deadline: new Date(Date.now() - 86400000).toISOString(), duration: 60 },
  { id: 'task-2', goalId: 'goal-1', title: 'Aprender sobre App Router', completed: false, priority: 'High', recurrence: 'None', deadline: new Date(Date.now() + 86400000).toISOString(), duration: 45 },
  { id: 'task-3', goalId: 'goal-1', title: 'Estudar Server Components', completed: false, priority: 'Medium', recurrence: 'None', deadline: new Date(Date.now() + 2 * 86400000).toISOString() },

  // Recipe App
  { id: 'task-4', goalId: 'goal-2', title: 'Definir o esquema do banco de dados', completed: true, priority: 'High', recurrence: 'None' },
  { id: 'task-5', goalId: 'goal-2', title: 'Desenhar a UI da lista de receitas', completed: false, priority: 'Medium', recurrence: 'Daily', deadline: new Date().toISOString(), duration: 90 },
  { id: 'task-6', goalId: 'goal-2', title: 'Implementar autenticação', completed: false, priority: 'Low', recurrence: 'None' },

  // Running
  { id: 'task-7', goalId: 'goal-3', title: 'Correr 1km', completed: true, priority: 'Medium', recurrence: 'None' },
  { id: 'task-8', goalId: 'goal-3', title: 'Correr 2km', completed: false, priority: 'Medium', recurrence: 'None', deadline: new Date(Date.now() + 3 * 86400000).toISOString() },
];

export const initialState: State = {
  goals,
  tasks,
};
