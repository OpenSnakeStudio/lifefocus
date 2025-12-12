import { useState, useEffect, useCallback } from 'react';
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

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransactionCompletion,
    getTodayTransactions,
    getTodayBalance,
  };
}
