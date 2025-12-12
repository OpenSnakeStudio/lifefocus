import { useState, useEffect, useCallback } from 'react';
import { Workout, WorkoutCompletion } from '@/types/fitness';

const WORKOUTS_KEY = 'habitflow_workouts';
const COMPLETIONS_KEY = 'habitflow_workout_completions';

export function useFitness() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedWorkouts = localStorage.getItem(WORKOUTS_KEY);
    const storedCompletions = localStorage.getItem(COMPLETIONS_KEY);
    
    if (storedWorkouts) {
      try {
        setWorkouts(JSON.parse(storedWorkouts));
      } catch (e) {
        console.error('Failed to parse workouts:', e);
      }
    }
    
    if (storedCompletions) {
      try {
        setCompletions(JSON.parse(storedCompletions));
      } catch (e) {
        console.error('Failed to parse completions:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  const saveWorkouts = useCallback((newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(newWorkouts));
  }, []);

  const saveCompletions = useCallback((newCompletions: WorkoutCompletion[]) => {
    setCompletions(newCompletions);
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(newCompletions));
  }, []);

  const addWorkout = useCallback((workout: Omit<Workout, 'id' | 'createdAt'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveWorkouts([...workouts, newWorkout]);
    return newWorkout;
  }, [workouts, saveWorkouts]);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    const newWorkouts = workouts.map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    saveWorkouts(newWorkouts);
  }, [workouts, saveWorkouts]);

  const deleteWorkout = useCallback((id: string) => {
    saveWorkouts(workouts.filter(w => w.id !== id));
  }, [workouts, saveWorkouts]);

  const toggleExerciseCompletion = useCallback((workoutId: string, exerciseId: string, date: string) => {
    const existingCompletion = completions.find(
      c => c.workoutId === workoutId && c.date === date
    );

    if (existingCompletion) {
      const isCompleted = existingCompletion.completedExercises.includes(exerciseId);
      const newCompletedExercises = isCompleted
        ? existingCompletion.completedExercises.filter(id => id !== exerciseId)
        : [...existingCompletion.completedExercises, exerciseId];

      const newCompletions = completions.map(c =>
        c.workoutId === workoutId && c.date === date
          ? { ...c, completedExercises: newCompletedExercises }
          : c
      );
      saveCompletions(newCompletions);
    } else {
      const newCompletion: WorkoutCompletion = {
        workoutId,
        date,
        completedExercises: [exerciseId],
      };
      saveCompletions([...completions, newCompletion]);
    }
  }, [completions, saveCompletions]);

  const getTodayWorkouts = useCallback(() => {
    const today = new Date().getDay();
    return workouts.filter(w => w.scheduledDays.includes(today));
  }, [workouts]);

  const getTodayExercises = useCallback(() => {
    const todayWorkouts = getTodayWorkouts();
    const today = new Date().toISOString().split('T')[0];
    
    return todayWorkouts.flatMap(workout => 
      workout.exercises.map(exercise => {
        const completion = completions.find(
          c => c.workoutId === workout.id && c.date === today
        );
        return {
          ...exercise,
          workoutId: workout.id,
          workoutName: workout.name,
          completed: completion?.completedExercises.includes(exercise.id) || false,
        };
      })
    );
  }, [getTodayWorkouts, completions]);

  const isExerciseCompleted = useCallback((workoutId: string, exerciseId: string, date: string) => {
    const completion = completions.find(
      c => c.workoutId === workoutId && c.date === date
    );
    return completion?.completedExercises.includes(exerciseId) || false;
  }, [completions]);

  return {
    workouts,
    completions,
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    toggleExerciseCompletion,
    getTodayWorkouts,
    getTodayExercises,
    isExerciseCompleted,
  };
}
