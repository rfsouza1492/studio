
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { initialState, State } from './initialState';

// Define action types for the reducer
type Action =
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'EDIT_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string };

interface GoalContextType {
  goals: Goal[];
  tasks: Task[];
  addGoal: (newGoal: Omit<Goal, 'id' | 'userId'>) => void;
  editGoal: (updatedGoal: Omit<Goal, 'userId'>) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number
  ) => void;
  editTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

// Reducer function to manage state changes
const goalReducer = (state: State, action: Action): State => {
  switch (action.type) {
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
    case 'TOGGLE_TASK':
        const task = state.tasks.find(t => t.id === action.payload);
        if (!task) return state;

        // Simple toggle without recurrence for local state
        const updatedTasks = state.tasks.map(t =>
            t.id === action.payload ? { ...t, completed: !t.completed } : t
        );
        return { ...state, tasks: updatedTasks };
    default:
      return state;
  }
};


export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(goalReducer, initialState);

  const addGoal = (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    const goalWithId: Goal = { 
        ...newGoal, 
        id: crypto.randomUUID(), 
        userId: 'mock-user-123' 
    };
    dispatch({ type: 'ADD_GOAL', payload: goalWithId });
  };

  const editGoal = (updatedGoal: Omit<Goal, 'userId'>) => {
    const goalWithUser: Goal = { ...updatedGoal, userId: 'mock-user-123'};
    dispatch({ type: 'EDIT_GOAL', payload: goalWithUser });
  };

  const deleteGoal = (goalId: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: goalId });
  };

  const addTask = (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      goalId,
      title,
      completed: false,
      priority,
      deadline: deadline?.toISOString(),
      recurrence,
      duration,
      userId: 'mock-user-123'
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const editTask = (updatedTask: Task) => {
    dispatch({ type: 'EDIT_TASK', payload: updatedTask });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = (taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  };

  const value: GoalContextType = {
    goals: state.goals,
    tasks: state.tasks,
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
