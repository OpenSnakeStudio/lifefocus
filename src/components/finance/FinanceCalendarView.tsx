import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceTransaction, getCategoryById } from '@/types/finance';
import { useTranslation } from '@/contexts/LanguageContext';
import { PeriodSelector } from '@/components/PeriodSelector';
import { cn } from '@/lib/utils';

interface FinanceCalendarViewProps {
  transactions: FinanceTransaction[];
  initialPeriod?: string;
}

export function FinanceCalendarView({ transactions, initialPeriod = '7' }: FinanceCalendarViewProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState(initialPeriod);
  
  const days = parseInt(period);
  
  const dates = useMemo(() => {
    const result: string[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push(date.toISOString().split('T')[0]);
    }
    
    return result;
  }, [days]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return t('today');
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Вчера';
    
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  };

  const getTransactionsForDate = (dateStr: string) => {
    return transactions.filter(t => t.date === dateStr);
  };

  const getDayBalance = (dateStr: string) => {
    const dayTransactions = getTransactionsForDate(dateStr);
    return dayTransactions.reduce((acc, t) => {
      return acc + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <PeriodSelector value={period as '7' | '14' | '30'} onValueChange={(v) => setPeriod(v)} />

      <div className="space-y-3">
        {dates.map((dateStr) => {
          const dayTransactions = getTransactionsForDate(dateStr);
          const dayBalance = getDayBalance(dateStr);
          
          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">
                  {getDateLabel(dateStr)}
                </span>
                <span className={cn(
                  "font-bold",
                  dayBalance >= 0 ? "text-green-500" : "text-destructive"
                )}>
                  {dayBalance >= 0 ? '+' : ''}{dayBalance.toLocaleString()} ₽
                </span>
              </div>
              
              {dayTransactions.length > 0 ? (
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => {
                    const category = getCategoryById(transaction.category);
                    return (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl",
                          transaction.completed ? "bg-muted/50 opacity-60" : "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category?.icon || '📦'}</span>
                          <span className={cn(
                            "text-sm",
                            transaction.completed && "line-through text-muted-foreground"
                          )}>
                            {transaction.name}
                          </span>
                        </div>
                        <span className={cn(
                          "font-medium text-sm",
                          transaction.type === 'income' ? "text-green-500" : "text-destructive"
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ₽
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Нет операций
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
