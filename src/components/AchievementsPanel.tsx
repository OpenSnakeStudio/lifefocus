import { motion } from 'framer-motion';
import { Trophy, Lock, Star, CheckCircle } from 'lucide-react';
import { useAchievements, ACHIEVEMENT_DEFINITIONS } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AchievementsPanel() {
  const { 
    achievements, 
    loading, 
    getEarnedAchievements, 
    getAvailableAchievements 
  } = useAchievements();

  const earnedAchievements = getEarnedAchievements();
  const availableAchievements = getAvailableAchievements();

  // Group by type
  const groupByType = (items: typeof ACHIEVEMENT_DEFINITIONS) => {
    return items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof ACHIEVEMENT_DEFINITIONS>);
  };

  const typeLabels: Record<string, string> = {
    subscription_streak: '🔥 Стрики',
    task_master: '✅ Задачи',
    habit_hero: '🌱 Привычки',
    social_star: '⭐ Социальные',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{earnedAchievements.length}</p>
            <p className="text-sm text-muted-foreground">Получено</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{availableAchievements.length}</p>
            <p className="text-sm text-muted-foreground">Доступно</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earned">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Полученные ({earnedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <Lock className="w-4 h-4" />
            Доступные ({availableAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-6 mt-4">
          {earnedAchievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Нет полученных достижений</p>
              <p className="text-sm text-muted-foreground">Выполняйте задачи и привычки, чтобы получить награды!</p>
            </div>
          ) : (
            Object.entries(groupByType(earnedAchievements)).map(([type, items]) => (
              <div key={type}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {typeLabels[type] || type}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map((achievement, i) => (
                    <motion.div
                      key={achievement.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/5 to-amber-500/10 border-yellow-500/20">
                        <CardContent className="p-4 text-center">
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-3xl mb-2 block">{achievement.icon}</span>
                          <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          {achievement.reward_stars && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="w-3 h-3" />
                              +{achievement.reward_stars}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6 mt-4">
          {Object.entries(groupByType(availableAchievements)).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {typeLabels[type] || type}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((achievement, i) => (
                  <motion.div
                    key={achievement.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="relative overflow-hidden bg-muted/30 border-muted">
                      <CardContent className="p-4 text-center">
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-3xl mb-2 block opacity-50">{achievement.icon}</span>
                        <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        {achievement.reward_stars && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="w-3 h-3" />
                            +{achievement.reward_stars}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
