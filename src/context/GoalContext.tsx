
"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch, useCallback, useState } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { addDays, addMonths, addWeeks } from 'date-fns';
import { initialState as fallbackState, type State } from './initialState';

type Action =
  | { type: 'SET_STATE'; payload: State }
  | { type: 'ADD_GOAL'; payload: Pick<Goal, 'id' | 'name'> & Partial<Omit<Goal, 'id' | 'name'>> }
  | { type: 'EDIT_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string } };

const emptyState: State = { goals: [], tasks: [] };

const goalReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STATE':
        if (!action.payload || !action.payload.goals || !action.payload.tasks) {
            return fallbackState;
        }
        return action.payload;
    case 'ADD_GOAL':
      const newGoal: Goal = {
        id: action.payload.id || crypto.randomUUID(), 
        name: action.payload.name,
        kpiName: action.payload.kpiName || undefined,
        kpiCurrent: action.payload.kpiCurrent || undefined,
        kpiTarget: action.payload.kpiTarget || undefined,
      };
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
      // Avoid adding duplicate tasks if they are already there from a previous session
      if (state.tasks.some(task => task.id === action.payload.id)) {
        return state;
      }
      return { ...state, tasks: [...state.tasks, action.payload] };
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
    case 'TOGGLE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (!task) return state;

      const updatedTask = { ...task, completed: !task.completed };

      // Handle recurring tasks: create a new one for the next period ONLY when completing
      if (updatedTask.completed && task.recurrence !== 'None' && task.deadline) {
          const currentDeadline = new Date(task.deadline);
          let nextDeadline: Date;

          switch (task.recurrence) {
              case 'Daily':
                  nextDeadline = addDays(currentDeadline, 1);
                  break;
              case 'Weekly':
                  nextDeadline = addWeeks(currentDeadline, 1);
                  break;
              case 'Monthly':
                  nextDeadline = addMonths(currentDeadline, 1);
                  break;
              default:
                  nextDeadline = currentDeadline; 
          }

          const recurringTask: Task = { ...task, id: crypto.randomUUID(), deadline: nextDeadline.toISOString(), completed: false };
          
          return {
              ...state,
              tasks: [...state.tasks.map(t => t.id === action.payload.id ? updatedTask : t), recurringTask],
          };
      }
      
      // Handle non-recurring tasks or un-checking a task
      return {
          ...state,
          tasks: state.tasks.map(t =>
              t.id === action.payload.id ? updatedTask : t
          ),
      };
    }
    default:
      return state;
  }
};

const GoalContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(goalReducer, emptyState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('goalFlowState');
      if (storedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
      } else {
        // If no state in localStorage, load the fallback example data
        dispatch({ type: 'SET_STATE', payload: fallbackState });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
      dispatch({ type: 'SET_STATE', payload: fallbackState });
    } finally {
        setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    // Only persist to localStorage if the state has been hydrated from the client
    if (isHydrated) {
        try {
            localStorage.setItem('goalFlowState', JSON.stringify(state));
        } catch (error) {
            console.error("Could not save state to localStorage", error);
        }
    }
  }, [state, isHydrated]);
  
  // Render children only after hydration to ensure consistency
  return (
    <GoalContext.Provider value={{ state, dispatch }}>
      {isHydrated ? children : null}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  const { state, dispatch } = context;

  const addGoal = useCallback((payload: Pick<Goal, 'id' | 'name'> & Partial<Omit<Goal, 'id' | 'name'>>) => dispatch({ type: 'ADD_GOAL', payload }), [dispatch]);
  const editGoal = useCallback((goal: Goal) => dispatch({ type: 'EDIT_GOAL', payload: goal }), [dispatch]);
  const deleteGoal = useCallback((id: string) => dispatch({ type: 'DELETE_GOAL', payload: { id } }), [dispatch]);

  const addTask = useCallback((goalId: string, title: string, priority: Priority, recurrence: Recurrence, deadline?: Date, duration?: number, completed?: boolean) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      goalId,
      title,
      completed: completed || false,
      priority,
      recurrence,
      deadline: deadline?.toISOString(),
      duration,
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  }, [dispatch]);

  const editTask = useCallback((task: Task) => dispatch({ type: 'EDIT_TASK', payload: task }), [dispatch]);
  const deleteTask = useCallback((id: string) => dispatch({ type: 'DELETE_TASK', payload: { id } }), [dispatch]);
  const toggleTask = useCallback((id: string) => dispatch({ type: 'TOGGLE_TASK', payload: { id } }), [dispatch]);

  return { ...state, dispatch, addGoal, editGoal, deleteGoal, addTask, editTask, deleteTask, toggleTask };
};
