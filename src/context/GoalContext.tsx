
"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { collection, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
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
  | { type: 'SET_GOALS', payload: Goal[] }
  | { type: 'SET_TASKS', payload: Task[] }
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
    case 'SET_GOALS':
      return { ...state, loading: state.loading && state.tasks.length === 0, goals: action.payload, error: null };
    case 'SET_TASKS':
        return { ...state, loading: false, tasks: action.payload, error: null };
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
  editTask: (updatedTask: Omit<Task, 'userId'>) => Promise<void>;
  deleteTask: (taskId: string, goalId: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [state, dispatch] = useReducer(goalReducer, initialState);

  const goalsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'goals') : null, [user, firestore]);
  const { data: goalsData, isLoading: goalsLoading, error: goalsError } = useCollection<Goal>(goalsCollectionRef);
  
  useEffect(() => {
    if(!user) {
        dispatch({ type: 'SET_GOALS', payload: [] });
        dispatch({ type: 'SET_TASKS', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
    }
    if (goalsData !== null) {
      dispatch({ type: 'SET_GOALS', payload: goalsData.map(g => ({...g, userId: user!.uid})) });
    }
    if (goalsError) {
      dispatch({ type: 'SET_ERROR', payload: goalsError as Error });
    }
    dispatch({ type: 'SET_LOADING', payload: goalsLoading });
  }, [goalsData, goalsLoading, goalsError, user]);

  useEffect(() => {
    if (!user || !firestore || goalsData === null) {
      dispatch({ type: 'SET_TASKS', payload: [] });
      if(!goalsLoading) dispatch({ type: 'SET_LOADING', payload: false });
      return;
    };
    
    const fetchAllTasks = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const allTasks: Task[] = [];
            
            // Create a loop of promises for all task fetching operations
            const taskPromises = goalsData.map(goal => {
                const tasksQuery = query(collection(firestore, 'users', user.uid, 'goals', goal.id, 'tasks'));
                return getDocs(tasksQuery);
            });

            const taskSnapshots = await Promise.all(taskPromises);

            taskSnapshots.forEach((snapshot, index) => {
                const goalId = goalsData[index].id;
                const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), goalId: goalId, userId: user.uid } as Task));
                allTasks.push(...tasks);
            });

            dispatch({ type: 'SET_TASKS', payload: allTasks });
        } catch (error) {
            console.error("Error fetching all tasks:", error);
            dispatch({ type: 'SET_ERROR', payload: error as Error });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }
    
    if(goalsData.length > 0) {
        fetchAllTasks();
    } else {
        // No goals, so no tasks
        dispatch({ type: 'SET_TASKS', payload: [] });
    }
  }, [goalsData, user, firestore, goalsLoading]);


  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    const goalData = { ...newGoalData };
    const goalRef = doc(collection(firestore, 'users', user.uid, 'goals'));
    const finalGoal = { ...goalData, id: goalRef.id };
    addDocumentNonBlocking(goalRef, finalGoal);
    dispatch({ type: 'ADD_GOAL', payload: {...finalGoal, userId: user.uid} });
  };

  const editGoal = async (updatedGoalData: Omit<Goal, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, ...goalData } = updatedGoalData;
    const goalRef = doc(firestore, 'users', user.uid, 'goals', id);
    updateDocumentNonBlocking(goalRef, goalData);
    dispatch({ type: 'EDIT_GOAL', payload: { ...updatedGoalData, userId: user.uid } });
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;

    // First delete sub-tasks in a batch
    const tasksQuery = query(collection(firestore, 'users', user.uid, 'goals', goalId, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    const batch = writeBatch(firestore);
    tasksSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Then delete the goal
    const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
    deleteDocumentNonBlocking(goalRef);

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
    if (!user || !firestore) return;
    const taskRef = doc(collection(firestore, 'users', user.uid, 'goals', goalId, 'tasks'));
    const newTask: Omit<Task, 'id'| 'userId'> = {
      goalId,
      title,
      completed: false,
      priority,
      deadline: deadline?.toISOString(),
      recurrence,
      duration,
    };
    addDocumentNonBlocking(taskRef, newTask);
    dispatch({ type: 'ADD_TASK', payload: { id: taskRef.id, ...newTask, userId: user.uid } });
  };

  const editTask = async (updatedTaskData: Omit<Task, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, goalId, ...taskData } = updatedTaskData;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', id);
    updateDocumentNonBlocking(taskRef, taskData);
    dispatch({ type: 'EDIT_TASK', payload: { ...updatedTaskData, userId: user.uid } });
  };

  const deleteTask = async (taskId: string, goalId: string) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = async (task: Task) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', task.goalId, 'tasks', task.id);
    const newCompletedStatus = !task.completed;
    updateDocumentNonBlocking(taskRef, { completed: newCompletedStatus });
    dispatch({ type: 'EDIT_TASK', payload: { ...task, completed: newCompletedStatus } });
  };

  const isLoading = state.loading || (user && !goalsData);

  if (isLoading && !user) {
     return <>{children}</>;
  }

  if (isLoading) {
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
    loading: isLoading,
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
