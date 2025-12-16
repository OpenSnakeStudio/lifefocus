import { useState, useEffect, useCallback } from 'react';
import { Workout, WorkoutCompletion, FitnessCategory, FitnessTag, DEFAULT_FITNESS_CATEGORIES, DEFAULT_FITNESS_TAGS } from '@/types/fitness';

const WORKOUTS_KEY = 'habitflow_workouts';
const COMPLETIONS_KEY = 'habitflow_workout_completions';
const CATEGORIES_KEY = 'habitflow_fitness_categories';
const TAGS_KEY = 'habitflow_fitness_tags';

export function useFitness() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [categories, setCategories] = useState<FitnessCategory[]>([]);
  const [tags, setTags] = useState<FitnessTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedWorkouts = localStorage.getItem(WORKOUTS_KEY);
    const storedCompletions = localStorage.getItem(COMPLETIONS_KEY);
    
    if (storedWorkouts) {
      try {
        const parsed = JSON.parse(storedWorkouts);
        // Migrate old workouts without tagIds
        const migrated = parsed.map((w: any) => ({
          ...w,
          tagIds: w.tagIds || [],
        }));
        setWorkouts(migrated);
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
    
    // Load categories
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch (e) {
        setCategories(DEFAULT_FITNESS_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_FITNESS_CATEGORIES);
    }
    
    // Load tags
    const storedTags = localStorage.getItem(TAGS_KEY);
    if (storedTags) {
      try {
        setTags(JSON.parse(storedTags));
      } catch (e) {
        setTags(DEFAULT_FITNESS_TAGS);
      }
    } else {
      setTags(DEFAULT_FITNESS_TAGS);
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

  const saveCategories = useCallback((newCategories: FitnessCategory[]) => {
    setCategories(newCategories);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
  }, []);

  const saveTags = useCallback((newTags: FitnessTag[]) => {
    setTags(newTags);
    localStorage.setItem(TAGS_KEY, JSON.stringify(newTags));
  }, []);

  const addWorkout = useCallback((workout: Omit<Workout, 'id' | 'createdAt'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tagIds: workout.tagIds || [],
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

  // Category management
  const addCategory = useCallback((category: Omit<FitnessCategory, 'id'>) => {
    const newCategory = { ...category, id: crypto.randomUUID() };
    saveCategories([...categories, newCategory]);
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<FitnessCategory>) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  }, [categories, saveCategories]);

  // Tag management
  const addTag = useCallback((tag: Omit<FitnessTag, 'id'>) => {
    const newTag = { ...tag, id: crypto.randomUUID() };
    saveTags([...tags, newTag]);
  }, [tags, saveTags]);

  const updateTag = useCallback((id: string, updates: Partial<FitnessTag>) => {
    saveTags(tags.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [tags, saveTags]);

  const deleteTag = useCallback((id: string) => {
    saveTags(tags.filter(t => t.id !== id));
  }, [tags, saveTags]);

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
    categories,
    tags,
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    toggleExerciseCompletion,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    getTodayWorkouts,
    getTodayExercises,
    isExerciseCompleted,
  };
}
