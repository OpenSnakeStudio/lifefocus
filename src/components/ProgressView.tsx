import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ru, enUS, es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Habit } from '@/types/habit';
import { PeriodSelector, Period } from './PeriodSelector';
import { useTranslation } from '@/contexts/LanguageContext';

interface ProgressViewProps {
  habits: Habit[];
  initialPeriod?: Period;
}

export function ProgressView({ habits, initialPeriod = '7' }: ProgressViewProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const { t, language } = useTranslation();

  const locale = language === 'ru' ? ru : language === 'es' ? es : enUS;

  const chartData = useMemo(() => {
    const today = new Date();
    const periodDays = parseInt(period);
    const days = eachDayOfInterval({
      start: subDays(today, periodDays - 1),
      end: today,
    });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completedCount = habits.reduce((count, habit) => {
        return count + (habit.completedDates.includes(dateStr) ? 1 : 0);
      }, 0);

      return {
        date: format(day, 'd MMM', { locale }),
        fullDate: dateStr,
        completed: completedCount,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
      };
    });
  }, [habits, period, locale]);

  const averageCompletion = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.percentage, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const totalCompleted = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.completed, 0);
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-end">
        <PeriodSelector value={period} onValueChange={setPeriod} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">{t('averageCompletion')}</p>
          <p className="text-2xl font-bold text-foreground">{averageCompletion}%</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">{t('totalCompleted')}</p>
          <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
        </div>
      </div>

      {/* Chart */}
      {habits.length > 0 ? (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h3 className="text-sm font-medium text-foreground mb-4">{t('dailyProgress')}</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                  className="text-muted-foreground"
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}%`, t('completedTasks')]}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t('noHabitsToShow')}
        </div>
      )}
    </motion.div>
  );
}
