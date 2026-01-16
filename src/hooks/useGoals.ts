import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Goal, GoalContact, GoalWithStats } from '@/types/goal';
import { toast } from 'sonner';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch goals
      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data for stats
      const goalsWithStats: GoalWithStats[] = await Promise.all(
        (goalsData || []).map(async (goal) => {
          // Get tasks count
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, completed')
            .eq('goal_id', goal.id);

          // Get habits count
          const { data: habits } = await supabase
            .from('habits')
            .select('id')
            .eq('goal_id', goal.id);

          // Get transactions sum
          const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('goal_id', goal.id);

          // Get time entries sum
          const { data: timeEntries } = await supabase
            .from('time_entries')
            .select('duration')
            .eq('goal_id', goal.id);

          // Get contacts count
          const { data: contacts } = await supabase
            .from('goal_contacts')
            .select('id')
            .eq('goal_id', goal.id);

          const tasksCount = tasks?.length || 0;
          const tasksCompleted = tasks?.filter(t => t.completed).length || 0;
          const totalSpent = transactions
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0) || 0;
          const totalTime = timeEntries?.reduce((sum, t) => sum + t.duration, 0) || 0;

          return {
            ...goal,
            tasks_count: tasksCount,
            tasks_completed: tasksCompleted,
            habits_count: habits?.length || 0,
            total_spent: totalSpent,
            total_time_minutes: Math.round(totalTime / 60),
            contacts_count: contacts?.length || 0,
          } as GoalWithStats;
        })
      );

      setGoals(goalsWithStats);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress_percent'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchGoals();
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Ошибка создания цели');
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Ошибка обновления цели');
    }
  };

  const deleteGoal = async (id: string, cascade: boolean = false) => {
    try {
      if (!cascade) {
        // Unlink items before deleting
        await supabase.from('tasks').update({ goal_id: null }).eq('goal_id', id);
        await supabase.from('habits').update({ goal_id: null }).eq('goal_id', id);
        await supabase.from('transactions').update({ goal_id: null }).eq('goal_id', id);
        await supabase.from('time_entries').update({ goal_id: null }).eq('goal_id', id);
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Ошибка удаления цели');
    }
  };

  const completeGoal = async (id: string) => {
    await updateGoal(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress_percent: 100,
    });
  };

  const archiveGoal = async (id: string) => {
    await updateGoal(id, {
      status: 'archived',
      archived_at: new Date().toISOString(),
    });
  };

  // Goal contacts
  const addContact = async (contact: Omit<GoalContact, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goal_contacts')
        .insert({
          ...contact,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchGoals();
      return data;
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  };

  const getGoalContacts = async (goalId: string): Promise<GoalContact[]> => {
    const { data, error } = await supabase
      .from('goal_contacts')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }

    return data || [];
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goal_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
    addContact,
    getGoalContacts,
    deleteContact,
    refetch: fetchGoals,
  };
}
