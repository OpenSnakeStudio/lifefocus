import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinanceTransaction, FinanceCategory, FinanceTag, DEFAULT_FINANCE_CATEGORIES, DEFAULT_FINANCE_TAGS } from '@/types/finance';
import { triggerCompletionCelebration } from '@/utils/celebrations';

const STORAGE_KEY = 'habitflow_finance';
const CATEGORIES_KEY = 'habitflow_finance_categories';
const TAGS_KEY = 'habitflow_finance_tags';

export function useFinance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate old transactions
        const migrated = parsed.map((t: any) => ({
          ...t,
          tagIds: t.tagIds || [],
        }));
        setTransactions(migrated);
      } catch (e) {
        console.error('Failed to parse transactions:', e);
      }
    }
    
    // Load categories
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch (e) {
        setCategories(DEFAULT_FINANCE_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_FINANCE_CATEGORIES);
    }
    
    // Load tags
    const storedTags = localStorage.getItem(TAGS_KEY);
    if (storedTags) {
      try {
        setTags(JSON.parse(storedTags));
      } catch (e) {
        setTags(DEFAULT_FINANCE_TAGS);
      }
    } else {
      setTags(DEFAULT_FINANCE_TAGS);
    }
    
    setIsLoading(false);
  }, []);

  const saveTransactions = useCallback((newTransactions: FinanceTransaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
  }, []);

  const saveCategories = useCallback((newCategories: FinanceCategory[]) => {
    setCategories(newCategories);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
  }, []);

  const saveTags = useCallback((newTags: FinanceTag[]) => {
    setTags(newTags);
    localStorage.setItem(TAGS_KEY, JSON.stringify(newTags));
  }, []);

  const addTransaction = useCallback((transaction: Omit<FinanceTransaction, 'id' | 'createdAt' | 'completed'>) => {
    const newTransaction: FinanceTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
      tagIds: transaction.tagIds || [],
    };
    saveTransactions([...transactions, newTransaction]);
    return newTransaction;
  }, [transactions, saveTransactions]);

  const updateTransaction = useCallback((id: string, updates: Partial<FinanceTransaction>) => {
    const newTransactions = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTransactions(newTransactions);
  }, [transactions, saveTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
  }, [transactions, saveTransactions]);

  const toggleTransactionCompletion = useCallback((id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const newCompleted = !transaction.completed;
    
    // Trigger celebration when completing
    if (newCompleted) {
      triggerCompletionCelebration();
    }

    updateTransaction(id, { 
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined
    });
  }, [transactions, updateTransaction]);

  // Category management
  const addCategory = useCallback((category: Omit<FinanceCategory, 'id'>) => {
    const newCategory = { ...category, id: crypto.randomUUID() };
    saveCategories([...categories, newCategory]);
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<FinanceCategory>) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  }, [categories, saveCategories]);

  // Tag management
  const addTag = useCallback((tag: Omit<FinanceTag, 'id'>) => {
    const newTag = { ...tag, id: crypto.randomUUID() };
    saveTags([...tags, newTag]);
  }, [tags, saveTags]);

  const updateTag = useCallback((id: string, updates: Partial<FinanceTag>) => {
    saveTags(tags.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [tags, saveTags]);

  const deleteTag = useCallback((id: string) => {
    saveTags(tags.filter(t => t.id !== id));
  }, [tags, saveTags]);

  const getTodayTransactions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(t => t.date === today);
  }, [transactions]);

  const getTodayBalance = useCallback(() => {
    const todayTransactions = getTodayTransactions();
    return todayTransactions.reduce((acc, t) => {
      if (t.completed) {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
      }
      return acc;
    }, 0);
  }, [getTodayTransactions]);

  const getTotalIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getCompletedIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income' && t.completed)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getCompletedExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.completed)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTransactionsByPeriod = useCallback((days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions]);

  const getTransactionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }, [transactions]);

  return {
    transactions,
    categories,
    tags,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransactionCompletion,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    getTodayTransactions,
    getTodayBalance,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getCompletedIncome,
    getCompletedExpenses,
    getTransactionsByPeriod,
    getTransactionsByDateRange,
  };
}
