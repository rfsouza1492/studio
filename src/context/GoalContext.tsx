
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Goal, Task, Priority, Recurrence } from '@/app/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp, // Optional: for timestamping
} from 'firebase/firestore';
import { addDays, addMonths, addWeeks } from 'date-fns';

// Define the shape of the context
interface GoalContextType {
  goals: Goal[];
  tasks: Task[];
  addGoal: (payload: Omit<Goal, 'id' | 'userId'>) => Promise<void>;
  editGoal: (goalId: string, payload: Partial<Omit<Goal, 'id' | 'userId'>>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addTask: (goalId: string, title: string, priority: Priority, recurrence: Recurrence, deadline?: Date, duration?: number) => Promise<void>;
  editTask: (taskId: string, payload: Partial<Omit<Task, 'id' | 'userId' | 'goalId'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
}

// Create the context
const GoalContext = createContext<GoalContextType | undefined>(undefined);

// Create the provider component
export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Set up real-time listeners for goals
    const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const goalsUnsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(goalsData);
    }, (error) => {
        console.error("Error fetching goals: ", error);
    });

    // Set up real-time listeners for tasks
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
      setLoading(false); // Considered loaded after tasks are fetched
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      goalsUnsubscribe();
      tasksUnsubscribe();
    };
  }, [user]);

  // --- CRUD Functions --- //

  const addGoal = async (payload: Omit<Goal, 'id' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addDoc(collection(db, 'goals'), {
        ...payload,
        userId: user.uid,
      });
    } catch (error) {
      console.error("Error adding goal: ", error);
    }
  };

  const editGoal = async (goalId: string, payload: Partial<Omit<Goal, 'id' | 'userId'>>) => {
    if (!user) throw new Error('User not authenticated');
    const goalRef = doc(db, 'goals', goalId);
    try {
      await updateDoc(goalRef, payload);
    } catch (error) {
      console.error("Error editing goal: ", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) throw new Error('User not authenticated');
    const goalRef = doc(db, 'goals', goalId);
    try {
      const batch = writeBatch(db);
      batch.delete(goalRef);
      
      const tasksToDelete = tasks.filter(t => t.goalId === goalId);
      tasksToDelete.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.delete(taskRef);
      });

      await batch.commit();

    } catch (error) {
      console.error("Error deleting goal and its tasks: ", error);
    }
  };

  const addTask = async (goalId: string, title: string, priority: Priority, recurrence: Recurrence, deadline?: Date, duration?: number) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addDoc(collection(db, 'tasks'), {
        goalId,
        title,
        priority,
        recurrence,
        deadline: deadline?.toISOString() || null,
        duration: duration || null,
        completed: false,
        userId: user.uid,
      });
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const editTask = async (taskId: string, payload: Partial<Omit<Task, 'id' | 'userId' | 'goalId'>>) => {
    if (!user) throw new Error('User not authenticated');
    const taskRef = doc(db, 'tasks', taskId);
    try {
      // Ensure goalId and userId are not accidentally overwritten
      const { goalId, userId, ...updatePayload } = payload as any;
      await updateDoc(taskRef, updatePayload);
    } catch (error) {
      console.error("Error editing task: ", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');
    const taskRef = doc(db, 'tasks', taskId);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) throw new Error("User not authenticated");

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error("Task not found");
        return;
    }

    const taskRef = doc(db, 'tasks', taskId);
    const newCompletedState = !task.completed;

    try {
        const batch = writeBatch(db);

        batch.update(taskRef, { completed: newCompletedState });

        if (newCompletedState && task.recurrence !== 'None' && task.deadline) {
            const currentDeadline = new Date(task.deadline);
            let nextDeadline: Date;

            switch (task.recurrence) {
                case 'Daily': nextDeadline = addDays(currentDeadline, 1); break;
                case 'Weekly': nextDeadline = addWeeks(currentDeadline, 1); break;
                case 'Monthly': nextDeadline = addMonths(currentDeadline, 1); break;
                default: nextDeadline = currentDeadline;
            }
            
            const newTaskData = { ...task };
            delete (newTaskData as any).id; // Remove the old ID
            
            const newTaskRef = doc(collection(db, 'tasks'));
            batch.set(newTaskRef, {
                ...newTaskData,
                completed: false,
                deadline: nextDeadline.toISOString(),
                userId: user.uid,
            });
        }

        await batch.commit();
    } catch (error) {
        console.error("Error toggling task: ", error);
    }
  };

  const contextValue: GoalContextType = {
    goals,
    tasks,
    addGoal: addGoal as any, // Cast to avoid complex type issues with pick/omit
    editGoal,
    deleteGoal,
    addTask,
    editTask,
    deleteTask,
    toggleTask,
  };

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Carregando dados...</p>
            </div>
        </div>
    );
  }

  return (
    <GoalContext.Provider value={contextValue}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
