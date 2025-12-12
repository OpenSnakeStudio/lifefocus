import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';

const STORAGE_KEY = 'habitflow_tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse tasks:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    saveTasks([...tasks, newTask]);
    return newTask;
  }, [tasks, saveTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTasks(newTasks);
  }, [tasks, saveTasks]);

  const deleteTask = useCallback((id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  }, [tasks, saveTasks]);

  const toggleTaskCompletion = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    updateTask(id, { 
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined
    });
  }, [tasks, updateTask]);

  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === today);
  }, [tasks]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTodayTasks,
  };
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
