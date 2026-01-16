import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, CheckSquare, Users, MoreVertical, Trash2, Archive, Check, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GoalWithStats } from '@/types/goal';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface GoalsListProps {
  goals: GoalWithStats[];
  loading: boolean;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function GoalsList({ goals, loading, onUpdate, onDelete, onComplete }: GoalsListProps) {
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {isRussian ? 'Нет целей' : 'No goals yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isRussian 
              ? 'Создайте свою первую цель и начните путь к её достижению'
              : 'Create your first goal and start your journey'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const archivedGoals = goals.filter(g => g.status === 'archived');

  const renderGoalCard = (goal: GoalWithStats) => {
    const progress = goal.tasks_count > 0 
      ? Math.round((goal.tasks_completed / goal.tasks_count) * 100)
      : goal.progress_percent;

    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cursor-pointer"
        onClick={() => navigate(`/goals/${goal.id}`)}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  {goal.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComplete(goal.id); }}>
                    <Check className="w-4 h-4 mr-2" />
                    {isRussian ? 'Завершить' : 'Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdate(goal.id, { status: 'archived', archived_at: new Date().toISOString() }); }}>
                    <Archive className="w-4 h-4 mr-2" />
                    {isRussian ? 'Архивировать' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isRussian ? 'Удалить' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {isRussian ? 'Прогресс' : 'Progress'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{goal.tasks_completed}/{goal.tasks_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>{goal.habits_count}</span>
              </div>
              {goal.total_spent > 0 && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{goal.total_spent.toLocaleString()}₽</span>
                </div>
              )}
              {goal.total_time_minutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(goal.total_time_minutes / 60)}ч</span>
                </div>
              )}
              {goal.contacts_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{goal.contacts_count}</span>
                </div>
              )}
            </div>

            {/* Status badge */}
            {goal.status !== 'active' && (
              <Badge 
                variant="secondary" 
                className="mt-2"
              >
                {goal.status === 'completed' 
                  ? (isRussian ? 'Завершена' : 'Completed')
                  : (isRussian ? 'В архиве' : 'Archived')
                }
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {isRussian ? 'Активные цели' : 'Active Goals'}
          </h3>
          <div className="space-y-3">
            {activeGoals.map(renderGoalCard)}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {isRussian ? 'Завершённые' : 'Completed'}
          </h3>
          <div className="space-y-3">
            {completedGoals.map(renderGoalCard)}
          </div>
        </div>
      )}

      {archivedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {isRussian ? 'Архив' : 'Archived'}
          </h3>
          <div className="space-y-3">
            {archivedGoals.map(renderGoalCard)}
          </div>
        </div>
      )}
    </div>
  );
}
