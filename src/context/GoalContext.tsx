"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Goal, Task, Priority } from '@/app/types';

interface State {
  goals: Goal[];
  tasks: Task[];
}

type Action =
  | { type: 'SET_STATE'; payload: State }
  | { type: 'ADD_GOAL'; payload: { name: string } }
  | { type: 'EDIT_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'ADD_TASK'; payload: { goalId: string; title: string; priority: Priority; deadline?: string } }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string } };

const initialState: State = {
  goals: [],
  tasks: [],
};

const goalReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_GOAL':
      const newGoal: Goal = { id: crypto.randomUUID(), name: action.payload.name };
      return { ...state, goals: [...state.goals, newGoal] };
    case 'EDIT_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload.id),
        tasks: state.tasks.filter(t => t.goalId !== action.payload.id),
      };
    case 'ADD_TASK':
      const newTask: Task = {
        id: crypto.randomUUID(),
        goalId: action.payload.goalId,
        title: action.payload.title,
        completed: false,
        priority: action.payload.priority,
        deadline: action.payload.deadline,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload.id),
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, completed: !t.completed } : t
        ),
      };
    default:
      return state;
  }
};

const GoalContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(goalReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('goalFlowState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Add default priority to tasks that don't have one
        if (parsedState.tasks) {
          parsedState.tasks = parsedState.tasks.map((t: any) => ({
            ...t,
            priority: t.priority || 'Medium',
          }));
        }
        dispatch({ type: 'SET_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('goalFlowState', JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);

  return (
    <GoalContext.Provider value={{ state, dispatch }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  const { state, dispatch } = context;

  const addGoal = (name: string) => dispatch({ type: 'ADD_GOAL', payload: { name } });
  const editGoal = (goal: Goal) => dispatch({ type: 'EDIT_GOAL', payload: goal });
  const deleteGoal = (id: string) => dispatch({ type: 'DELETE_GOAL', payload: { id } });

  const addTask = (goalId: string, title: string, priority: Priority, deadline?: Date) => dispatch({ type: 'ADD_TASK', payload: { goalId, title, priority, deadline: deadline?.toISOString() } });
  const editTask = (task: Task) => dispatch({ type: 'EDIT_TASK', payload: task });
  const deleteTask = (id: string) => dispatch({ type: 'DELETE_TASK', payload: { id } });
  const toggleTask = (id: string) => dispatch({ type: 'TOGGLE_TASK', payload: { id } });

  return { ...state, addGoal, editGoal, deleteGoal, addTask, editTask, deleteTask, toggleTask };
};
