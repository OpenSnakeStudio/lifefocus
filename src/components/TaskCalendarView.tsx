import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskCategory } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import { format, eachDayOfInterval, startOfWeek, addDays, isBefore, parseISO, startOfDay } from 'date-fns';
import { ru, es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, FileText, Paperclip, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskCalendarViewProps {
  tasks: Task[];
  categories: TaskCategory[];
  period: 7 | 14 | 30;
  onToggleTask: (id: string) => void;
  onOpenTask?: (task: Task) => void;
}

const priorityLabels = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

export function TaskCalendarView({ tasks, categories, period, onToggleTask, onOpenTask }: TaskCalendarViewProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const locale = language === 'ru' ? ru : language === 'es' ? es : enUS;

  // Start from current week going forward
  const days = useMemo(() => {
    const result: { date: Date; dateStr: string; dayName: string }[] = [];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    for (let i = 0; i < period; i++) {
      const date = addDays(weekStart, i);
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

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    const todayStart = startOfDay(new Date());
    const taskDate = startOfDay(parseISO(dueDate));
    return isBefore(taskDate, todayStart);
  };

  const hasNotes = (task: Task) => task.notes && task.notes.trim().length > 0;
  const hasAttachments = (task: Task) => task.attachments && task.attachments.length > 0;
  const hasSubtasks = (task: Task) => task.subtasks && task.subtasks.length > 0;

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
              "bg-card rounded-2xl p-3 border transition-all",
              isToday ? "border-task/50 bg-task/5" : "border-border"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "text-center min-w-[40px]",
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
              <div className="space-y-1">
                {dayTasks.map(task => {
                  const category = getCategory(task.categoryId);
                  const isExpanded = expandedTasks.has(task.id);
                  const overdue = isOverdue(task.dueDate, task.completed);
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "rounded-xl border transition-all overflow-hidden",
                        task.completed 
                          ? "bg-muted/30 border-muted" 
                          : overdue 
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-background border-border hover:border-task/30"
                      )}
                    >
                      {/* Compact View - 2 lines */}
                      <div 
                        className="p-2 cursor-pointer"
                        onClick={() => toggleExpanded(task.id)}
                      >
                        {/* Line 1: Title */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => onToggleTask(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0"
                          />
                          <span className="text-lg shrink-0">{task.icon}</span>
                          <span className={cn(
                            "flex-1 text-sm font-medium truncate",
                            task.completed && "line-through text-muted-foreground"
                          )}>
                            {task.name}
                          </span>
                          <button 
                            className="p-1 hover:bg-muted rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(task.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        
                        {/* Line 2: Priority, Tags, Indicators */}
                        <div className="flex items-center gap-2 mt-1 ml-8 flex-wrap">
                          {/* Priority */}
                          <span className="text-xs" title={`Priority: ${task.priority}`}>
                            {priorityLabels[task.priority] || priorityLabels.medium}
                          </span>
                          
                          {/* Category */}
                          {category && (
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: category.color + '20', color: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                          
                          {/* Tag count */}
                          {task.tagIds && task.tagIds.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{task.tagIds.length} {language === 'ru' ? 'тегов' : 'tags'}
                            </span>
                          )}
                          
                          {/* Indicators */}
                          <div className="flex items-center gap-1 ml-auto">
                            {hasNotes(task) && (
                              <FileText className="w-3 h-3 text-muted-foreground" />
                            )}
                            {hasAttachments(task) && (
                              <Paperclip className="w-3 h-3 text-muted-foreground" />
                            )}
                            {hasSubtasks(task) && (
                              <span className="text-[10px] text-muted-foreground">
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded View */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                              {/* Notes */}
                              {hasNotes(task) && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {language === 'ru' ? 'Описание' : 'Description'}
                                  </p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {task.notes}
                                  </p>
                                </div>
                              )}

                              {/* Subtasks / Checklist */}
                              {hasSubtasks(task) && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {language === 'ru' ? 'Чек-лист' : 'Checklist'} ({completedSubtasks}/{task.subtasks.length})
                                  </p>
                                  <div className="space-y-1">
                                    {task.subtasks.slice(0, 5).map((subtask) => (
                                      <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className={cn(
                                          "w-3.5 h-3.5",
                                          subtask.completed ? "text-task" : "text-muted-foreground"
                                        )} />
                                        <span className={cn(
                                          subtask.completed && "line-through text-muted-foreground"
                                        )}>
                                          {subtask.name}
                                        </span>
                                      </div>
                                    ))}
                                    {task.subtasks.length > 5 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{task.subtasks.length - 5} {language === 'ru' ? 'еще' : 'more'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Attachments */}
                              {hasAttachments(task) && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {language === 'ru' ? 'Вложения' : 'Attachments'}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {task.attachments.map((att) => (
                                      <span key={att.id} className="text-xs bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                                        <Paperclip className="w-3 h-3" />
                                        {att.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Open full details */}
                              {onOpenTask && (
                                <button
                                  onClick={() => onOpenTask(task)}
                                  className="text-xs text-task hover:underline"
                                >
                                  {language === 'ru' ? 'Открыть полностью →' : 'Open full view →'}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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