
"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { collection, doc, query, writeBatch, getDocs, where, onSnapshot, Unsubscribe, collectionGroup, setDoc } from 'firebase/firestore';
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
  addGoal: (newGoal: Omit<Goal, 'id' | 'userId'>) => Promise<string>;
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
    
    let tasksUnsub: Unsubscribe = () => {};
    let goalsData: Goal[] = [];
    let tasksData: Task[] = [];
    let goalsLoaded = false;
    let tasksLoaded = false;

    const maybeSetData = () => {
      if (goalsLoaded && tasksLoaded) {
        dispatch({ type: 'SET_DATA', payload: { goals: goalsData, tasks: tasksData } });
      }
    };

    const goalsUnsub = onSnapshot(goalsQuery, 
      (goalsSnapshot) => {
        goalsData = goalsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
        goalsLoaded = true;
        maybeSetData();
      }, 
      (error) => {
        console.error("Error fetching goals:", error);
        const contextualError = new FirestorePermissionError({ operation: 'list', path: `users/${user.uid}/goals` });
        dispatch({ type: 'SET_ERROR', payload: contextualError });
        errorEmitter.emit('permission-error', contextualError);
      }
    );
    
    if (user.uid) {
        const tasksQuery = query(collectionGroup(firestore, 'tasks'), where('userId', '==', user.uid));
        tasksUnsub = onSnapshot(tasksQuery, (tasksSnapshot) => {
            tasksData = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
            tasksLoaded = true;
            maybeSetData();
        }, (error) => {
            console.error("Error fetching tasks:", error);
            const contextualError = new FirestorePermissionError({ operation: 'list', path: `tasks collection group for user ${user.uid}` });
            dispatch({ type: 'SET_ERROR', payload: contextualError });
            errorEmitter.emit('permission-error', contextualError);
        });
    } else {
        tasksLoaded = true;
        maybeSetData();
    }


    return () => {
      goalsUnsub();
      tasksUnsub();
    };
  
  }, [user, isUserLoading, firestore]);
  

  const removeUndefined = (obj: any) => {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        } else {
            newObj[key] = null;
        }
    });
    return newObj;
  };

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'userId'>): Promise<string> => {
    if (!user || !firestore) return '';
    const goalRef = doc(collection(firestore, 'users', user.uid, 'goals'));
    const finalGoal: Goal = { 
      name: newGoalData.name,
      id: goalRef.id, 
      userId: user.uid,
      kpiName: newGoalData.kpiName || null,
      kpiCurrent: newGoalData.kpiCurrent || 0,
      kpiTarget: newGoalData.kpiTarget || 0,
    };
    
    const cleanGoal = removeUndefined(finalGoal);
    await setDoc(goalRef, cleanGoal);
    dispatch({ type: 'ADD_GOAL', payload: cleanGoal as Goal });
    return goalRef.id;
  };

  const editGoal = async (updatedGoalData: Omit<Goal, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, ...goalData } = updatedGoalData;
    const goalRef = doc(firestore, 'users', user.uid, 'goals', id);
    const cleanGoalData = {
        name: goalData.name,
        kpiName: goalData.kpiName || null,
        kpiCurrent: goalData.kpiCurrent || 0,
        kpiTarget: goalData.kpiTarget || 0,
    };
    await updateDocumentNonBlocking(goalRef, cleanGoalData);
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
      await batch.commit().catch(error => {
          console.error("Error deleting tasks in batch:", error);
          const contextualError = new FirestorePermissionError({ operation: 'delete', path: `tasks in goal ${goalId}` });
          errorEmitter.emit('permission-error', contextualError);
      });
    }
    
    const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
    await deleteDocumentNonBlocking(goalRef);
    dispatch({ type: 'DELETE_GOAL', payload: goalId });
  };

  const addTask = async (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number,
    completed = false
  ) => {
    if (!user || !firestore) return;
    const taskRef = doc(collection(firestore, 'users', user.uid, 'goals', goalId, 'tasks'));
    const newTask: Task = {
      id: taskRef.id,
      goalId,
      title,
      completed,
      priority,
      deadline: deadline ? deadline.toISOString() : null,
      recurrence,
      duration: duration || null,
      userId: user.uid,
    };
    const cleanTask = removeUndefined(newTask);
    await setDocumentNonBlocking(taskRef, cleanTask, {});
    dispatch({ type: 'ADD_TASK', payload: cleanTask as Task });
  };

  const editTask = async (updatedTaskData: Omit<Task, 'userId'>) => {
    if (!user || !firestore) return;
    const { id, goalId, ...taskData } = updatedTaskData;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', id);
    const cleanTaskData = {
        title: taskData.title,
        priority: taskData.priority,
        deadline: taskData.deadline || null,
        recurrence: taskData.recurrence,
        duration: taskData.duration || null,
        completed: taskData.completed
    };
    await updateDocumentNonBlocking(taskRef, cleanTaskData);
    dispatch({ type: 'EDIT_TASK', payload: { ...updatedTaskData, userId: user.uid } });
  };

  const deleteTask = async (taskId: string, goalId: string) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', goalId, 'tasks', taskId);
    await deleteDocumentNonBlocking(taskRef);
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = async (task: Task) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'goals', task.goalId, 'tasks', task.id);
    const newCompletedStatus = !task.completed;
    await updateDocumentNonBlocking(taskRef, { completed: newCompletedStatus });
    dispatch({ type: 'EDIT_TASK', payload: { ...task, completed: newCompletedStatus } });
  };

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
