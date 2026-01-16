import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/contexts/LanguageContext';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface GoalProgressChartProps {
  tasks: any[];
  habits: any[];
  transactions: any[];
  timeEntries: any[];
  goalColor: string;
}

export function GoalProgressChart({ tasks, habits, transactions, timeEntries, goalColor }: GoalProgressChartProps) {
  const { language } = useTranslation();
  const isRussian = language === 'ru';

  // Prepare daily activity data for the last 14 days
  const activityData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 13), end: today });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      
      // Tasks completed on this day
      const tasksCompleted = tasks.filter(t => 
        t.completed && t.updated_at && format(new Date(t.updated_at), 'yyyy-MM-dd') === dayStr
      ).length;

      // Habits completed on this day
      const habitsCompleted = habits.filter(h => 
        h.completed_dates?.includes(dayStr)
      ).length;

      // Time spent on this day (in minutes)
      const timeMinutes = timeEntries
        .filter(e => format(new Date(e.start_time), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, e) => sum + Math.round(e.duration / 60), 0);

      // Money spent on this day
      const spent = transactions
        .filter(t => t.date === dayStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, 'dd.MM', { locale: isRussian ? ru : enUS }),
        tasks: tasksCompleted,
        habits: habitsCompleted,
        time: timeMinutes,
        spent,
      };
    });
  }, [tasks, habits, timeEntries, transactions, isRussian]);

  // Pie chart data for task status
  const taskStatusData = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    
    return [
      { name: isRussian ? 'Выполнено' : 'Completed', value: completed, color: 'hsl(var(--chart-2))' },
      { name: isRussian ? 'В работе' : 'Pending', value: pending, color: 'hsl(var(--muted))' },
    ].filter(d => d.value > 0);
  }, [tasks, isRussian]);

  const hasActivityData = activityData.some(d => d.tasks > 0 || d.habits > 0 || d.time > 0);
  const hasTaskData = tasks.length > 0;

  if (!hasActivityData && !hasTaskData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Activity over time */}
      {hasActivityData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isRussian ? 'Активность за 14 дней' : 'Activity (14 days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={goalColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={goalColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    name={isRussian ? 'Задачи' : 'Tasks'}
                    stroke={goalColor}
                    fill="url(#colorActivity)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="habits"
                    name={isRussian ? 'Привычки' : 'Habits'}
                    stroke="hsl(var(--chart-2))"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task completion pie */}
      {hasTaskData && taskStatusData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isRussian ? 'Статус задач' : 'Task Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {taskStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
