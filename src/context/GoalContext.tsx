
"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { collection, doc, query, writeBatch, getDocs, where, collectionGroup, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
  | { type: 'CLEAR_DATA' }
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
    case 'CLEAR_DATA':
      return initialState;
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [state, dispatch] = useReducer(goalReducer, initialState);
  
  useEffect(() => {
    // Don't do anything until we know for sure if a user is logged in or not.
    if (isUserLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }
  
    // If there is no user, clear the data and stop.
    if (!user) {
      dispatch({ type: 'CLEAR_DATA' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
  
    // At this point, we have a valid, authenticated user.
    // Set up Firestore listeners.
    dispatch({ type: 'SET_LOADING', payload: true });
  
    const goalsQuery = query(collection(firestore, 'users', user.uid, 'goals'));
    const tasksQuery = query(collectionGroup(firestore, 'tasks'), where('userId', '==', user.uid));
  
    let goalsData: Goal[] = [];
    let tasksData: Task[] = [];
    let goalsLoaded = false;
    let tasksLoaded = false;
  
    const updateCombinedData = () => {
      if (goalsLoaded && tasksLoaded) {
        dispatch({ type: 'SET_DATA', payload: { goals: goalsData, tasks: tasksData } });
      }
    };
  
    const goalsUnsub: Unsubscribe = onSnapshot(goalsQuery, 
      (snapshot) => {
        goalsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
        goalsLoaded = true;
        updateCombinedData();
      }, 
      (error) => {
        console.error("Error fetching goals:", error);
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    );
  
    const tasksUnsub: Unsubscribe = onSnapshot(tasksQuery, 
      (snapshot) => {
        tasksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
        tasksLoaded = true;
        updateCombinedData();
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    );
  
    // Cleanup function to unsubscribe when the component unmounts or the user changes.
    return () => {
      goalsUnsub();
      tasksUnsub();
    };
  
  }, [user, isUserLoading, firestore]);
  

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    const goalRef = doc(collection(firestore, 'users', user.uid, 'goals'));
    const finalGoal = { ...newGoalData, id: goalRef.id, userId: user.uid };
    addDocumentNonBlocking(goalRef, finalGoal);
    // Optimistic update
    dispatch({ type: 'ADD_GOAL', payload: finalGoal });
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
    if(!tasksSnapshot.empty){
      const batch = writeBatch(firestore);
      tasksSnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
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
    const newTask: Omit<Task, 'id'> = {
      goalId,
      title,
      completed: false,
      priority,
      deadline: deadline?.toISOString(),
      recurrence,
      duration,
      userId: user.uid,
    };
    addDocumentNonBlocking(taskRef, newTask);
    dispatch({ type: 'ADD_TASK', payload: { id: taskRef.id, ...newTask } });
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

    