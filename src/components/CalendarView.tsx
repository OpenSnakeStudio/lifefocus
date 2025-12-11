import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { ru, enUS, es } from 'date-fns/locale';
import { Habit } from '@/types/habit';
import { PeriodSelector, Period } from './PeriodSelector';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface CalendarViewProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  initialPeriod?: Period;
}

export function CalendarView({ habits, onToggle, initialPeriod = '7' }: CalendarViewProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const { t, language } = useTranslation();

  const locale = language === 'ru' ? ru : language === 'es' ? es : enUS;

  const days = useMemo(() => {
    const today = new Date();
    const periodDays = parseInt(period);
    return eachDayOfInterval({
      start: subDays(today, periodDays - 1),
      end: today,
    });
  }, [period]);

  const getCompletionForDay = (habit: Habit, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const handleToggle = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onToggle(habitId, dateStr);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-end">
        <PeriodSelector value={period} onValueChange={setPeriod} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-muted-foreground pb-3 pr-4 min-w-[120px]">
                {t('habit')}
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "text-center text-xs font-medium pb-3 px-1",
                    isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div>{format(day, 'd')}</div>
                  <div className="text-[10px]">{format(day, 'EEE', { locale })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                      {habit.name}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const isCompleted = getCompletionForDay(habit, day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <td key={day.toISOString()} className="py-2 px-1 text-center">
                      <button
                        onClick={() => handleToggle(habit.id, day)}
                        className={cn(
                          "w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-all",
                          "hover:scale-110 active:scale-95 cursor-pointer",
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isToday
                            ? "bg-muted border border-primary/50 hover:bg-primary/20"
                            : "bg-muted hover:bg-muted-foreground/20"
                        )}
                      >
                        {isCompleted && <span className="text-xs">✓</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {habits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('noHabitsToShow')}
        </div>
      )}
    </motion.div>
  );
}
