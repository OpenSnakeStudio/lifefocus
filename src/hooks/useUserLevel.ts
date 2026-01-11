import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface UserLevel {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  tasks_completed: number;
  habits_completed: number;
  stars_earned: number;
  created_at: string;
  updated_at: string;
}

interface LevelInfo {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  tasksCompleted: number;
  habitsCompleted: number;
  starsEarned: number;
  progressPercent: number;
}

// XP rewards
const XP_REWARDS = {
  task: 25,       // Complete a task
  habit: 15,      // Complete a habit
  star: 10,       // Earn a star
  streak_3: 50,   // 3-day streak
  streak_7: 100,  // 7-day streak
  streak_30: 500, // 30-day streak
};

// Level titles
const LEVEL_TITLES: Record<number, { ru: string; en: string }> = {
  1: { ru: 'Новичок', en: 'Newbie' },
  2: { ru: 'Ученик', en: 'Learner' },
  3: { ru: 'Практикант', en: 'Apprentice' },
  4: { ru: 'Исполнитель', en: 'Achiever' },
  5: { ru: 'Мастер', en: 'Master' },
  6: { ru: 'Эксперт', en: 'Expert' },
  7: { ru: 'Профи', en: 'Pro' },
  8: { ru: 'Гуру', en: 'Guru' },
  9: { ru: 'Легенда', en: 'Legend' },
  10: { ru: 'Чемпион', en: 'Champion' },
};

export function useUserLevel() {
  const { user } = useAuth();
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLevelInfo = useCallback(async () => {
    if (!user) {
      setLevelInfo(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching level info:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Calculate XP in current level
        let xpInCurrentLevel = data.total_xp;
        let level = 1;
        let requirement = 100;
        
        while (xpInCurrentLevel >= requirement) {
          xpInCurrentLevel -= requirement;
          level++;
          requirement = 100 * level;
        }

        setLevelInfo({
          level: data.current_level,
          totalXp: data.total_xp,
          xpToNextLevel: data.xp_to_next_level,
          xpInCurrentLevel,
          tasksCompleted: data.tasks_completed,
          habitsCompleted: data.habits_completed,
          starsEarned: data.stars_earned,
          progressPercent: Math.round((xpInCurrentLevel / data.xp_to_next_level) * 100),
        });
      } else {
        // Initialize level for new user
        const { error: insertError } = await supabase
          .from('user_levels')
          .insert({ user_id: user.id });

        if (!insertError) {
          setLevelInfo({
            level: 1,
            totalXp: 0,
            xpToNextLevel: 100,
            xpInCurrentLevel: 0,
            tasksCompleted: 0,
            habitsCompleted: 0,
            starsEarned: 0,
            progressPercent: 0,
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchLevelInfo:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLevelInfo();
  }, [fetchLevelInfo]);

  const addXp = useCallback(async (source: 'task' | 'habit' | 'star' | 'streak_3' | 'streak_7' | 'streak_30', language: string = 'ru') => {
    if (!user) return;

    const xpAmount = XP_REWARDS[source];
    const previousLevel = levelInfo?.level || 1;

    try {
      const { data, error } = await supabase.rpc('add_user_xp', {
        p_user_id: user.id,
        p_xp_amount: xpAmount,
        p_xp_source: source.includes('streak') ? 'streak' : source,
      });

      if (error) {
        console.error('Error adding XP:', error);
        return;
      }

      // Check for level up
      if (data && data.length > 0 && data[0].leveled_up) {
        const newLevel = data[0].new_level;
        const title = LEVEL_TITLES[Math.min(newLevel, 10)] || LEVEL_TITLES[10];
        
        // Celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        
        toast.success(
          language === 'ru' 
            ? `🎉 Уровень ${newLevel}! Вы теперь "${title.ru}"!`
            : `🎉 Level ${newLevel}! You are now "${title.en}"!`,
          { duration: 5000 }
        );
      }

      // Refresh level info
      await fetchLevelInfo();
    } catch (err) {
      console.error('Error in addXp:', err);
    }
  }, [user, levelInfo, fetchLevelInfo]);

  const getLevelTitle = (level: number, language: string = 'ru'): string => {
    const levelData = LEVEL_TITLES[Math.min(level, 10)] || LEVEL_TITLES[10];
    return language === 'ru' ? levelData.ru : levelData.en;
  };

  const getLevelColor = (level: number): string => {
    if (level >= 10) return 'from-yellow-500 to-amber-600';
    if (level >= 8) return 'from-purple-500 to-pink-500';
    if (level >= 6) return 'from-blue-500 to-cyan-500';
    if (level >= 4) return 'from-green-500 to-emerald-500';
    if (level >= 2) return 'from-gray-400 to-gray-500';
    return 'from-gray-300 to-gray-400';
  };

  return {
    levelInfo,
    loading,
    addXp,
    getLevelTitle,
    getLevelColor,
    refetch: fetchLevelInfo,
    XP_REWARDS,
  };
}