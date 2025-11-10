
"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { collection, doc, query, writeBatch, getDocs, where, onSnapshot, Unsubscribe, collectionGroup } from 'firebase/firestore';
import { useFirestore, useUser, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, errorEmitter, FirestorePermissionError } from '@/firebase';
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
      return { ...initialState, loading: false };
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
    if (isUserLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }

    if (!user) {
      dispatch({ type: 'CLEAR_DATA' });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });

    const goalsQuery = query(collection(firestore, 'users', user.uid, 'goals'));
    
    const goalsUnsub = onSnapshot(goalsQuery, 
      (goalsSnapshot) => {
        const goalsData = goalsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));

        if (goalsData.length === 0) {
            // If there are no goals, there are no tasks to fetch.
            dispatch({ type: 'SET_DATA', payload: { goals: [], tasks: [] } });
            return;
        }

        // Fetch tasks for each goal individually (avoids collectionGroup issues)
        const allTasksData: Task[] = [];
        let completedGoals = 0;
        const taskUnsubscribers: (() => void)[] = [];

        const checkIfComplete = () => {
          completedGoals++;
          if (completedGoals === goalsData.length) {
            dispatch({ type: 'SET_DATA', payload: { goals: goalsData, tasks: allTasksData } });
          }
        };

        goalsData.forEach((goal) => {
          const tasksQuery = query(
            collection(firestore, 'users', user.uid, 'goals', goal.id, 'tasks')
          );
          
          const tasksUnsub = onSnapshot(tasksQuery, 
            (tasksSnapshot) => {
              // Remove old tasks from this goal
              const otherGoalTasks = allTasksData.filter(t => t.goalId !== goal.id);
              // Add new tasks from this goal
              const thisGoalTasks = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
              allTasksData.length = 0;
              allTasksData.push(...otherGoalTasks, ...thisGoalTasks);
              
              // Update state with all tasks
              dispatch({ type: 'SET_DATA', payload: { goals: goalsData, tasks: [...allTasksData] } });
            }, 
            (error) => {
              console.error(`Error fetching tasks for goal ${goal.id}:`, error);
              checkIfComplete();
            }
          );
          
          taskUnsubscribers.push(tasksUnsub);
        });

        // Return cleanup function for all task listeners
        return () => {
          taskUnsubscribers.forEach(unsub => unsub());
        };

      }, 
      (error) => {
        console.error("Error fetching goals:", error);
        const contextualError = new FirestorePermissionError({ operation: 'list', path: `users/${user.uid}/goals` });
        dispatch({ type: 'SET_ERROR', payload: contextualError });
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      goalsUnsub();
    };
  
  }, [user, isUserLoading, firestore]);
  

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    const goalRef = doc(collection(firestore, 'users', user.uid, 'goals'));
    const finalGoal = { ...newGoalData, id: goalRef.id, userId: user.uid };
    setDocumentNonBlocking(goalRef, finalGoal, {});
    // Optimistic update
    dispatch({ type: 'ADD_GOAL', payload: finalGoal });
  };

  const editGoal = async (updatedGoalData: Omit<Goal, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, ...goalData } = updatedGoalData;
    const goalRef = doc(firestore, 'users', user.uid, 'goals', id);
    updateDocumentNonBlocking(goalRef, goalData);
     // Optimistic update
    dispatch({ type: 'EDIT_GOAL', payload: { ...updatedGoalData, userId: user.uid } });
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;

    const tasksQuery = query(collection(firestore, 'users', user.uid, 'goals', goalId, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    if(!tasksSnapshot.empty){
      const batch = writeBatch(firestore);
      tasksSnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });
      // Non-blocking commit
      batch.commit().catch(error => {
          console.error("Error deleting tasks in batch:", error);
          const contextualError = new FirestorePermissionError({ operation: 'delete', path: `tasks in goal ${goalId}` });
          errorEmitter.emit('permission-error', contextualError);
      });
    }
    
    const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
    deleteDocumentNonBlocking(goalRef);

    // Optimistic update
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
    const newTask: Task = {
      id: taskRef.id,
      goalId,
      title,
      completed: false,
      priority,
      deadline: deadline?.toISOString(),
      recurrence,
      duration,
      userId: user.uid,
    };
    setDocumentNonBlocking(taskRef, newTask, {});
     // Optimistic update
    dispatch({ type: 'ADD_TASK', payload: { id: taskRef.id, ...newTask } });
  };

  const editTask = async (updatedTaskData: Omit<Task, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, goalId, ...taskData } = updatedTaskData;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', id);
    updateDocumentNonBlocking(taskRef, taskData);
     // Optimistic update
    dispatch({ type: 'EDIT_TASK', payload: { ...updatedTaskData, userId: user.uid } });
  };

  const deleteTask = async (taskId: string, goalId: string) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
     // Optimistic update
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = async (task: Task) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', task.goalId, 'tasks', task.id);
    const newCompletedStatus = !task.completed;
    updateDocumentNonBlocking(taskRef, { completed: newCompletedStatus });
     // Optimistic update
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

    