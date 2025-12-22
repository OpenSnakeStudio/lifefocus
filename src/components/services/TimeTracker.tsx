import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { useTasks } from '@/hooks/useTasks';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type Period = 'today' | 'week' | 'month';

export function TimeTracker() {
  const { t } = useTranslation();
  const {
    entries,
    activeTimer,
    elapsedTime,
    startTimer,
    stopTimer,
    deleteEntry,
    formatDuration,
    isTimerRunning,
  } = useTimeTracker();
  
  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Filter entries by period
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    switch (selectedPeriod) {
      case 'today':
        startDate = startOfToday;
        break;
      case 'week':
        startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(startOfToday);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    return entries.filter(e => new Date(e.startTime) >= startDate);
  }, [entries, selectedPeriod]);

  const totalTime = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.duration, 0);
  }, [filteredEntries]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, { name: string; icon?: string; duration: number; entryIds: string[] }> = {};
    filteredEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      const key = entry.taskId || 'none';
      const name = task?.name || 'Без задачи';
      const icon = task?.icon;
      
      if (!groups[key]) {
        groups[key] = { name, icon, duration: 0, entryIds: [] };
      }
      groups[key].duration += entry.duration;
      groups[key].entryIds.push(entry.id);
    });
    return Object.entries(groups).sort((a, b) => b[1].duration - a[1].duration);
  }, [filteredEntries, tasks]);

  const handleStart = () => {
    if (selectedTaskId) {
      startTimer(selectedTaskId, selectedSubtaskId || undefined);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSelectedSubtaskId(null);
    setIsTaskSelectorOpen(false);
  };

  const handleDeleteTaskEntries = (entryIds: string[]) => {
    entryIds.forEach(id => deleteEntry(id));
  };

  const periodLabels: Record<Period, string> = {
    today: t('today') || 'Сегодня',
    week: t('week') || 'Неделя',
    month: t('month') || 'Месяц',
  };

  return (
    <div className="space-y-4">
      {/* Active timer display */}
      <div className="text-center py-4">
        <div className="text-4xl font-bold text-foreground tracking-tight">
          {formatDuration(isTimerRunning ? elapsedTime : 0)}
        </div>
        {isTimerRunning && activeTimer && (
          <p className="text-sm text-muted-foreground mt-1">
            {tasks.find(t => t.id === activeTimer.taskId)?.name || 'Задача'}
          </p>
        )}
      </div>

      {/* Task selector */}
      <div className="space-y-2">
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsTaskSelectorOpen(!isTaskSelectorOpen)}
            disabled={isTimerRunning}
          >
            <span className="flex items-center gap-2">
              {selectedTask ? (
                <>
                  <span>{selectedTask.icon}</span>
                  <span>{selectedTask.name}</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {t('selectTask') || 'Выберите задачу'}
                </span>
              )}
            </span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", isTaskSelectorOpen && "rotate-180")} />
          </Button>
          
          <AnimatePresence>
            {isTaskSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-auto"
              >
                {tasks.filter(t => !t.completed).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2"
                  >
                    <span>{task.icon}</span>
                    <span className="flex-1">{task.name}</span>
                    {task.subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {task.subtasks.filter(s => !s.completed).length} подзадач
                      </span>
                    )}
                  </button>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    {t('noActiveTasks') || 'Нет активных задач'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtask selector */}
        {selectedTask && selectedTask.subtasks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubtaskId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubtaskId(null)}
              disabled={isTimerRunning}
            >
              {t('wholeTask') || 'Вся задача'}
            </Button>
            {selectedTask.subtasks.filter(s => !s.completed).map(subtask => (
              <Button
                key={subtask.id}
                variant={selectedSubtaskId === subtask.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubtaskId(subtask.id)}
                disabled={isTimerRunning}
              >
                {subtask.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Start/Stop button */}
      <div className="flex justify-center">
        {isTimerRunning ? (
          <Button
            size="lg"
            variant="destructive"
            onClick={stopTimer}
            className="w-28 h-10 gap-2"
          >
            <Square className="w-4 h-4" />
            {t('stop') || 'Стоп'}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={!selectedTaskId}
            className="w-28 h-10 gap-2 bg-service hover:bg-service/90"
          >
            <Play className="w-4 h-4" />
            {t('start') || 'Старт'}
          </Button>
        )}
      </div>

      {/* Period selector */}
      <div className="flex justify-center gap-2">
        {(['today', 'week', 'month'] as Period[]).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {periodLabels[period]}
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {periodLabels[selectedPeriod]}
          </h4>
          <span className="text-lg font-bold text-service">
            {formatDuration(totalTime)}
          </span>
        </div>

        {groupedEntries.length > 0 ? (
          <div className="space-y-2">
            {groupedEntries.map(([key, data]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {data.icon && <span>{data.icon}</span>}
                  <span>{data.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {formatDuration(data.duration)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteTaskEntries(data.entryIds)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t('noTimeEntriesYet') || 'Записей пока нет'}
          </p>
        )}
      </div>
    </div>
  );
}
