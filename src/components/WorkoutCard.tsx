import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Workout } from '@/types/fitness';
import { useFitness } from '@/hooks/useFitness';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkoutCardProps {
  workout: Workout;
  index: number;
  isToday: boolean;
  onToggleExercise: (exerciseId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function WorkoutCard({ workout, index, isToday, onToggleExercise, onEdit, onDelete }: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const { t } = useTranslation();
  const { isExerciseCompleted } = useFitness();
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-2xl shadow-card border transition-all",
        isToday ? "border-fitness" : "border-border"
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            <span className="text-2xl">{workout.icon}</span>
            <div>
              <h3 className="font-medium text-foreground">{workout.name}</h3>
              <p className="text-xs text-muted-foreground">
                {workout.exercises.length} упражнений • {workout.scheduledDays.map(d => WEEKDAYS_SHORT[d]).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {workout.exercises.map((exercise) => {
                const completed = isExerciseCompleted(workout.id, exercise.id, today);
                return (
                  <button
                    key={exercise.id}
                    onClick={() => onToggleExercise(exercise.id)}
                    disabled={!isToday}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
                      completed
                        ? "bg-fitness/10 opacity-60"
                        : "bg-background hover:bg-muted/30",
                      !isToday && "opacity-50 cursor-default"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        completed
                          ? "border-transparent bg-fitness"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    <span 
                      className={cn(
                        "text-sm flex-1",
                        completed && "line-through text-muted-foreground"
                      )}
                    >
                      {exercise.name}
                    </span>

                    {exercise.sets && exercise.reps && (
                      <span className="text-xs text-muted-foreground">
                        {exercise.sets}×{exercise.reps}
                      </span>
                    )}
                    {exercise.duration && (
                      <span className="text-xs text-muted-foreground">
                        {exercise.duration} мин
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
