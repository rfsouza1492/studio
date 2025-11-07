
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
} from 'firebase/firestore';
import { addDays, addMonths, addWeeks } from 'date-fns';
import { Target } from 'lucide-react';

interface GoalContextType {
  goals: Goal[];
  tasks: Task[];
  addGoal: (newGoal: Omit<Goal, 'id' | 'userId'>) => void;
  editGoal: (updatedGoal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number,
    completed?: boolean
  ) => void;
  editTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

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

    const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const goalsUnsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
      setGoals(goalsData);
    });

    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
      setTasks(tasksData);
      setLoading(false);
    });

    return () => {
      goalsUnsubscribe();
      tasksUnsubscribe();
    };
  }, [user]);

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'goals'), { ...newGoal, userId: user.uid });
  };

  const editGoal = async (updatedGoal: Goal) => {
    if (!user) return;
    const { id, ...goalData } = updatedGoal;
    await updateDoc(doc(db, 'goals', id), goalData);
  };
  
  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    
    const batch = writeBatch(db);
    
    // Delete the goal
    const goalRef = doc(db, 'goals', goalId);
    batch.delete(goalRef);
    
    // Delete all tasks associated with the goal
    const goalTasks = tasks.filter(task => task.goalId === goalId);
    goalTasks.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.delete(taskRef);
    });
    
    await batch.commit();
  };

  const addTask = async (
    goalId: string,
    title: string,
    priority: Priority,
    recurrence: Recurrence,
    deadline?: Date,
    duration?: number,
    completed: boolean = false
  ) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      goalId,
      title,
      completed,
      priority,
      deadline: deadline?.toISOString() ?? null,
      recurrence,
      duration: duration ?? null,
      userId: user.uid,
    });
  };

  const editTask = async (updatedTask: Task) => {
    if (!user) return;
    const { id, ...taskData } = updatedTask;
    await updateDoc(doc(db, 'tasks', id), taskData);
  };
  
  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'tasks', taskId));
  };
  
  const toggleTask = useCallback(async (taskId: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;

    const batch = writeBatch(db);
    const taskRef = doc(db, 'tasks', taskId);
    batch.update(taskRef, { completed: newCompletedState });
    
    // If the task is being marked as complete and it's a recurring task
    if (newCompletedState && task.recurrence !== 'None' && task.deadline) {
      const currentDeadline = new Date(task.deadline);
      let nextDeadline: Date;

      switch(task.recurrence) {
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
            nextDeadline = currentDeadline; // Should not happen
            break;
      }
      
      const newTaskPayload = { ...task };
      // Omit 'id' for the new document
      delete (newTaskPayload as any).id;
      
      const newTaskRef = doc(collection(db, "tasks"));
      batch.set(newTaskRef, {
          ...newTaskPayload,
          completed: false,
          deadline: nextDeadline.toISOString(),
          userId: user.uid,
      });
    }

    await batch.commit();

  }, [tasks, user]);
  

  const value: GoalContextType = {
    goals,
    tasks,
    addGoal,
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
