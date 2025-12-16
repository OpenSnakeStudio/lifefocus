import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskCategory } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { ru, es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface TaskCalendarViewProps {
  tasks: Task[];
  categories: TaskCategory[];
  period: 7 | 14 | 30;
  onToggleTask: (id: string) => void;
}

export function TaskCalendarView({ tasks, categories, period, onToggleTask }: TaskCalendarViewProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const locale = language === 'ru' ? ru : language === 'es' ? es : enUS;

  const days = useMemo(() => {
    const result: { date: Date; dateStr: string; dayName: string }[] = [];
    const today = new Date();
    
    for (let i = period - 1; i >= 0; i--) {
      const date = subDays(today, i);
      result.push({
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE', { locale }),
      });
    }
    return result;
  }, [period, locale]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!map[task.dueDate]) {
        map[task.dueDate] = [];
      }
      map[task.dueDate].push(task);
    });
    return map;
  }, [tasks]);

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const statusColors = {
    not_started: 'bg-muted',
    in_progress: 'bg-amber-500/20 border-amber-500',
    done: 'bg-task/20 border-task',
  };

  return (
    <div className="space-y-3">
      {days.map(({ date, dateStr, dayName }, index) => {
        const dayTasks = tasksByDate[dateStr] || [];
        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
        
        return (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={cn(
              "bg-card rounded-2xl p-4 border transition-all",
              isToday ? "border-task/50" : "border-border"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "text-center",
                isToday && "text-task"
              )}>
                <div className="text-xs text-muted-foreground uppercase">{dayName}</div>
                <div className="text-lg font-bold">{format(date, 'd')}</div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">
                  {dayTasks.length} {t('tasks').toLowerCase()}
                </span>
              </div>
            </div>

            {dayTasks.length > 0 ? (
              <div className="space-y-2">
                {dayTasks.map(task => {
                  const category = getCategory(task.categoryId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border",
                        statusColors[task.status]
                      )}
                    >
                      <span className="text-lg">{task.icon}</span>
                      <span className={cn(
                        "flex-1 text-sm",
                        task.status === 'done' && "line-through text-muted-foreground"
                      )}>
                        {task.name}
                      </span>
                      {category && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: category.color + '33', color: category.color }}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                {t('noTasksForDay')}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
