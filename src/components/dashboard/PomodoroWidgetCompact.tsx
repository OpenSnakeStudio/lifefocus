import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Brain, Coffee, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroPhase } from '@/types/service';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

export function PomodoroWidgetCompact() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  
  const {
    currentPhase,
    timeLeft,
    isRunning,
    currentTaskId,
    start,
    pause,
    reset,
  } = usePomodoro();

  const activeTasks = tasks.filter(task => !task.completed);
  const selectedTask = tasks.find(t => t.id === currentTaskId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInfo = (phase: PomodoroPhase) => {
    switch (phase) {
      case 'work':
        return { icon: Brain, color: 'hsl(var(--service))' };
      case 'short_break':
        return { icon: Coffee, color: 'hsl(var(--success))' };
      case 'long_break':
        return { icon: Zap, color: 'hsl(var(--accent))' };
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);
  const PhaseIcon = phaseInfo.icon;

  const handleTaskSelect = (taskId: string) => {
    start(taskId);
    setIsTaskSelectorOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-2 shadow-card border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <PhaseIcon className="w-3 h-3" style={{ color: phaseInfo.color }} />
          <span className="font-medium text-[10px]">{t('pomodoroTimer')}</span>
        </div>
      </div>

      {/* Timer and controls */}
      <div className="flex items-center gap-2">
        {/* Compact timer circle */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke={phaseInfo.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 17}`}
              strokeDashoffset={`${2 * Math.PI * 17 * (1 - timeLeft / (currentPhase === 'work' ? 25 * 60 : currentPhase === 'short_break' ? 5 * 60 : 15 * 60))}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Controls - two round buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            className="h-6 w-6 rounded-full"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </Button>
          
          <Button
            size="icon"
            onClick={() => isRunning ? pause() : (currentTaskId ? start(currentTaskId) : setIsTaskSelectorOpen(true))}
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: phaseInfo.color }}
          >
            {isRunning ? (
              <Pause className="w-2.5 h-2.5" />
            ) : (
              <Play className="w-2.5 h-2.5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Task selector */}
      <div className="mt-1.5 pt-1.5 border-t border-border relative">
        <button 
          onClick={() => setIsTaskSelectorOpen(!isTaskSelectorOpen)}
          className="w-full flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="truncate flex-1 text-left">
            {selectedTask ? (
              <span className="flex items-center gap-1">
                {selectedTask.icon && <span>{selectedTask.icon}</span>}
                <span className="text-foreground">{selectedTask.name}</span>
              </span>
            ) : (
              t('selectTask') || 'Выберите задачу'
            )}
          </span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", isTaskSelectorOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isTaskSelectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-32 overflow-auto"
            >
              {activeTasks.length > 0 ? (
                activeTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className="w-full px-2 py-1.5 text-left hover:bg-muted flex items-center gap-1.5 text-[10px]"
                  >
                    {task.icon && <span>{task.icon}</span>}
                    <span className="truncate">{task.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-2 py-2 text-[10px] text-muted-foreground text-center">
                  {t('noActiveTasks') || 'Нет активных задач'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
