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
