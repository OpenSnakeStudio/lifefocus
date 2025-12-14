import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinanceTransaction } from '@/types/finance';

const STORAGE_KEY = 'habitflow_finance';

export function useFinance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse transactions:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveTransactions = useCallback((newTransactions: FinanceTransaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
  }, []);

  const addTransaction = useCallback((transaction: Omit<FinanceTransaction, 'id' | 'createdAt' | 'completed'>) => {
    const newTransaction: FinanceTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
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

    updateTransaction(id, { 
      completed: !transaction.completed,
      completedAt: !transaction.completed ? new Date().toISOString() : undefined
    });
  }, [transactions, updateTransaction]);

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
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransactionCompletion,
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
