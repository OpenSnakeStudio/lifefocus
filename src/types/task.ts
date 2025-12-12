export interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export const TASK_ICONS = [
  '📝', '✅', '📋', '🎯', '💼', '📞', '✉️', '🛒',
  '🏠', '🚗', '💰', '📅', '🔔', '⭐', '🔧', '📦'
];

export const TASK_COLORS = [
  'hsl(200, 80%, 50%)', // blue (primary for tasks)
  'hsl(168, 80%, 40%)', // teal
  'hsl(35, 95%, 55%)',  // orange
  'hsl(262, 80%, 55%)', // purple
  'hsl(340, 80%, 55%)', // pink
  'hsl(145, 70%, 45%)', // green
  'hsl(45, 90%, 50%)',  // yellow
  'hsl(0, 70%, 55%)',   // red
];
