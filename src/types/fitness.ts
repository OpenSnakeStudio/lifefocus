export interface FitnessCategory {
  id: string;
  name: string;
  color: string;
}

export interface FitnessTag {
  id: string;
  name: string;
  color: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // in minutes
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  icon: string;
  color: string;
  exercises: Exercise[];
  scheduledDays: number[]; // 0-6, Sunday to Saturday
  createdAt: string;
  categoryId?: string;
  tagIds: string[];
}

export interface WorkoutCompletion {
  workoutId: string;
  date: string;
  completedExercises: string[]; // exercise IDs
}

export const WORKOUT_ICONS = [
  '🏋️', '🏃', '🚴', '🧘', '🏊', '⚽', '🎾', '🥊',
  '💪', '🤸', '🧗', '🏓', '⛳', '🎿', '🛹', '🏸'
];

export const WORKOUT_COLORS = [
  'hsl(262, 80%, 55%)', // purple (primary for fitness)
  'hsl(168, 80%, 40%)', // teal
  'hsl(35, 95%, 55%)',  // orange
  'hsl(200, 80%, 50%)', // blue
  'hsl(340, 80%, 55%)', // pink
  'hsl(145, 70%, 45%)', // green
  'hsl(45, 90%, 50%)',  // yellow
  'hsl(0, 70%, 55%)',   // red
];

export const DEFAULT_FITNESS_CATEGORIES: FitnessCategory[] = [
  { id: 'strength', name: 'Силовые', color: 'hsl(262, 80%, 55%)' },
  { id: 'cardio', name: 'Кардио', color: 'hsl(0, 70%, 55%)' },
  { id: 'flexibility', name: 'Гибкость', color: 'hsl(168, 80%, 40%)' },
  { id: 'sports', name: 'Спорт', color: 'hsl(35, 95%, 55%)' },
];

export const DEFAULT_FITNESS_TAGS: FitnessTag[] = [
  { id: 'beginner', name: 'Начинающий', color: 'hsl(145, 70%, 45%)' },
  { id: 'intense', name: 'Интенсив', color: 'hsl(0, 70%, 55%)' },
  { id: 'recovery', name: 'Восстановление', color: 'hsl(200, 80%, 50%)' },
];
