export interface Task {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
}
