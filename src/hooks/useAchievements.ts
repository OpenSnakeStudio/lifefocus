import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_key: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

interface AchievementDefinition {
  key: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward_stars?: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Subscription streaks
  { key: 'streak_3', type: 'subscription_streak', name: '3 дня подряд', description: 'Выполняйте задачи 3 дня подряд', icon: '🔥', requirement: 3, reward_stars: 5 },
  { key: 'streak_7', type: 'subscription_streak', name: 'Неделя продуктивности', description: 'Выполняйте задачи 7 дней подряд', icon: '⭐', requirement: 7, reward_stars: 15 },
  { key: 'streak_14', type: 'subscription_streak', name: '2 недели без перерыва', description: 'Выполняйте задачи 14 дней подряд', icon: '💪', requirement: 14, reward_stars: 30 },
  { key: 'streak_30', type: 'subscription_streak', name: 'Месяц в деле', description: 'Выполняйте задачи 30 дней подряд', icon: '🏆', requirement: 30, reward_stars: 75 },
  { key: 'streak_60', type: 'subscription_streak', name: '60 дней марафона', description: 'Выполняйте задачи 60 дней подряд', icon: '👑', requirement: 60, reward_stars: 150 },
  { key: 'streak_100', type: 'subscription_streak', name: 'Легенда 100 дней', description: 'Выполняйте задачи 100 дней подряд', icon: '🌟', requirement: 100, reward_stars: 300 },
  
  // Task achievements
  { key: 'tasks_10', type: 'task_master', name: 'Начинающий', description: 'Выполните 10 задач', icon: '📋', requirement: 10, reward_stars: 5 },
  { key: 'tasks_50', type: 'task_master', name: 'Исполнитель', description: 'Выполните 50 задач', icon: '✅', requirement: 50, reward_stars: 20 },
  { key: 'tasks_100', type: 'task_master', name: 'Профессионал', description: 'Выполните 100 задач', icon: '🎯', requirement: 100, reward_stars: 50 },
  { key: 'tasks_500', type: 'task_master', name: 'Мастер задач', description: 'Выполните 500 задач', icon: '🏅', requirement: 500, reward_stars: 150 },
  
  // Habit achievements
  { key: 'habits_7', type: 'habit_hero', name: 'Первая привычка', description: 'Выполните привычку 7 раз', icon: '🌱', requirement: 7, reward_stars: 10 },
  { key: 'habits_30', type: 'habit_hero', name: 'Привычка на месяц', description: 'Выполните привычку 30 раз', icon: '🌿', requirement: 30, reward_stars: 30 },
  { key: 'habits_100', type: 'habit_hero', name: 'Привычка на 100', description: 'Выполните привычку 100 раз', icon: '🌳', requirement: 100, reward_stars: 100 },
  
  // Social achievements  
  { key: 'likes_10', type: 'social_star', name: 'Первые лайки', description: 'Получите 10 лайков', icon: '❤️', requirement: 10, reward_stars: 10 },
  { key: 'likes_50', type: 'social_star', name: 'Популярность', description: 'Получите 50 лайков', icon: '💕', requirement: 50, reward_stars: 30 },
  { key: 'followers_5', type: 'social_star', name: 'Первые подписчики', description: 'Получите 5 подписчиков', icon: '👥', requirement: 5, reward_stars: 15 },
  { key: 'followers_20', type: 'social_star', name: 'Лидер мнений', description: 'Получите 20 подписчиков', icon: '🌟', requirement: 20, reward_stars: 50 },
];

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(d => ({
        ...d,
        metadata: (d.metadata as Record<string, unknown>) || {}
      }));
      setAchievements(mapped);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const checkAndAwardAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user stats
      const [starsRes, tasksRes, habitsRes, likesRes, followersRes] = await Promise.all([
        supabase.from('user_stars').select('current_streak_days').eq('user_id', user.id).single(),
        supabase.from('user_levels').select('tasks_completed').eq('user_id', user.id).single(),
        supabase.from('user_levels').select('habits_completed').eq('user_id', user.id).single(),
        supabase.from('post_reactions')
          .select('id', { count: 'exact' })
          .eq('reaction_type', 'like')
          .in('post_id', 
            (await supabase.from('achievement_posts').select('id').eq('user_id', user.id)).data?.map(p => p.id) || []
          ),
        supabase.from('user_subscriptions').select('id', { count: 'exact' }).eq('following_id', user.id)
      ]);

      const stats = {
        subscription_streak: starsRes.data?.current_streak_days || 0,
        task_master: tasksRes.data?.tasks_completed || 0,
        habit_hero: habitsRes.data?.habits_completed || 0,
        social_star_likes: likesRes.count || 0,
        social_star_followers: followersRes.count || 0
      };

      // Check which achievements can be awarded
      const existingKeys = new Set(achievements.map(a => a.achievement_key));
      const newAchievements: { key: string; type: string; stars: number }[] = [];

      for (const def of ACHIEVEMENT_DEFINITIONS) {
        if (existingKeys.has(def.key)) continue;

        let shouldAward = false;

        if (def.type === 'subscription_streak') {
          shouldAward = stats.subscription_streak >= def.requirement;
        } else if (def.type === 'task_master') {
          shouldAward = stats.task_master >= def.requirement;
        } else if (def.type === 'habit_hero') {
          shouldAward = stats.habit_hero >= def.requirement;
        } else if (def.type === 'social_star') {
          if (def.key.includes('likes')) {
            shouldAward = stats.social_star_likes >= def.requirement;
          } else if (def.key.includes('followers')) {
            shouldAward = stats.social_star_followers >= def.requirement;
          }
        }

        if (shouldAward) {
          newAchievements.push({ key: def.key, type: def.type, stars: def.reward_stars || 0 });
        }
      }

      // Award new achievements
      for (const achievement of newAchievements) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: achievement.type,
            achievement_key: achievement.key,
            metadata: { awarded_stars: achievement.stars }
          });

        if (!error && achievement.stars > 0) {
          // Award stars via transaction
          await supabase
            .from('star_transactions')
            .insert({
              user_id: user.id,
              amount: achievement.stars,
              transaction_type: 'achievement',
              description: `Достижение: ${ACHIEVEMENT_DEFINITIONS.find(d => d.key === achievement.key)?.name}`
            });

          const def = ACHIEVEMENT_DEFINITIONS.find(d => d.key === achievement.key);
          if (def) {
            toast.success(`🎉 Достижение: ${def.name}`, {
              description: `+${achievement.stars} звёзд`
            });
          }
        }
      }

      if (newAchievements.length > 0) {
        await fetchAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user, achievements, fetchAchievements]);

  const getProgress = (achievementKey: string): { current: number; required: number } => {
    // This would need actual stat fetching for real-time progress
    return { current: 0, required: 0 };
  };

  const getEarnedAchievements = () => {
    return ACHIEVEMENT_DEFINITIONS.filter(def => 
      achievements.some(a => a.achievement_key === def.key)
    ).map(def => ({
      ...def,
      earned_at: achievements.find(a => a.achievement_key === def.key)?.earned_at
    }));
  };

  const getAvailableAchievements = () => {
    return ACHIEVEMENT_DEFINITIONS.filter(def => 
      !achievements.some(a => a.achievement_key === def.key)
    );
  };

  return {
    achievements,
    loading,
    checkAndAwardAchievements,
    getProgress,
    getEarnedAchievements,
    getAvailableAchievements,
    allDefinitions: ACHIEVEMENT_DEFINITIONS,
    refetch: fetchAchievements
  };
}
