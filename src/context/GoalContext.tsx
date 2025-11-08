"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { useAuth } from './AuthContext';
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Target } from 'lucide-react';

interface State {
  goals: Goal[];
  tasks: Task[];
  loading: boolean;
  error: Error | null;
}

const initialState: State = {
  goals: [],
  tasks: [],
  loading: true,
  error: null,
};

type Action =
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_DATA', payload: { goals: Goal[], tasks: Task[] } }
  | { type: 'SET_ERROR', payload: Error }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'EDIT_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string };

const goalReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, loading: false, goals: action.payload.goals, tasks: action.payload.tasks, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'EDIT_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => (g.id === action.payload.id ? action.payload : g)),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
        tasks: state.tasks.filter(t => t.goalId !== action.payload),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };
    default:
      return state;
  }
};

interface GoalContextType {
  goals: Goal[];
  tasks: Task[];
  loading: boolean;
  addGoal: (newGoal: Omit<Goal, 'id' | 'userId'>) => Promise<void>;
  editGoal: (updatedGoal: Omit<Goal, 'userId'>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addTask: (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number,
    completed?: boolean
  ) => Promise<void>;
  editTask: (updatedTask: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [state, dispatch] = useReducer(goalReducer, initialState);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const goalsQuery = query(collection(firestore, 'goals'), where('userId', '==', user.uid));
          const tasksQuery = query(collection(firestore, 'tasks'), where('userId', '==', user.uid));

          const [goalsSnapshot, tasksSnapshot] = await Promise.all([
            getDocs(goalsQuery),
            getDocs(tasksQuery),
          ]);

          const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
          const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
          
          dispatch({ type: 'SET_DATA', payload: { goals, tasks } });
        } catch (error) {
          console.error("Error fetching data:", error);
          dispatch({ type: 'SET_ERROR', payload: error as Error });
        }
      };
      fetchData();
    } else {
      dispatch({ type: 'SET_DATA', payload: { goals: [], tasks: [] } });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, firestore]);

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    if (!user) return;
    const goalWithUser = { ...newGoal, userId: user.uid };
    const docRef = await addDocumentNonBlocking(collection(firestore, 'goals'), goalWithUser);
    dispatch({ type: 'ADD_GOAL', payload: { id: docRef.id, ...goalWithUser } });
  };

  const editGoal = async (updatedGoal: Omit<Goal, 'userId'>) => {
    if (!user) return;
    const goalRef = doc(firestore, 'goals', updatedGoal.id);
    updateDocumentNonBlocking(goalRef, updatedGoal);
    dispatch({ type: 'EDIT_GOAL', payload: { ...updatedGoal, userId: user.uid } });
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    const goalRef = doc(firestore, 'goals', goalId);
    deleteDocumentNonBlocking(goalRef);
    // You might want to delete sub-tasks in a batch or using a cloud function
    dispatch({ type: 'DELETE_GOAL', payload: goalId });
  };

  const addTask = async (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number
  ) => {
    if (!user) return;
    const newTask: Omit<Task, 'id'> = {
      goalId,
      title,
      completed: false,
      priority,
      deadline: deadline?.toISOString(),
      recurrence,
      duration,
      userId: user.uid
    };
    const docRef = await addDocumentNonBlocking(collection(firestore, 'tasks'), newTask);
    dispatch({ type: 'ADD_TASK', payload: { id: docRef.id, ...newTask } });
  };

  const editTask = async (updatedTask: Task) => {
    if (!user) return;
    const taskRef = doc(firestore, 'tasks', updatedTask.id);
    updateDocumentNonBlocking(taskRef, updatedTask);
    dispatch({ type: 'EDIT_TASK', payload: updatedTask });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const taskRef = doc(firestore, 'tasks', taskId);
    const newCompletedStatus = !task.completed;
    updateDocumentNonBlocking(taskRef, { completed: newCompletedStatus });
    dispatch({ type: 'EDIT_TASK', payload: { ...task, completed: newCompletedStatus } });
  };

  if (state.loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Carregando dados...</p>
            </div>
        </div>
    );
  }

  const value: GoalContextType = {
    ...state,
    addGoal,
    editGoal,
    deleteGoal,
    addTask,
    editTask,
    deleteTask,
    toggleTask,
  };

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
