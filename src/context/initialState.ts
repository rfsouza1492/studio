
import type { Goal, Task } from '@/app/types';

export interface State {
  goals: Goal[];
  tasks: Task[];
}

const goals: Goal[] = [];
const tasks: Task[] = [];

export const initialState: State = {
  goals,
  tasks,
};
