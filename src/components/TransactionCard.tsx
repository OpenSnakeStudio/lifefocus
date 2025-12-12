import { motion } from 'framer-motion';
import { Check, MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { FinanceTransaction, FINANCE_CATEGORIES } from '@/types/finance';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionCardProps {
  transaction: FinanceTransaction;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionCard({ transaction, index, onToggle, onEdit, onDelete }: TransactionCardProps) {
  const { t } = useTranslation();

  const category = FINANCE_CATEGORIES.find(c => c.id === transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-2xl p-4 shadow-card border border-border transition-all",
        transaction.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5",
            transaction.completed
              ? "border-transparent bg-finance"
              : "border-finance/50 hover:border-finance"
          )}
        >
          {transaction.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{category?.icon || '💰'}</span>
              <h3 
                className={cn(
                  "font-medium text-foreground",
                  transaction.completed && "line-through text-muted-foreground"
                )}
              >
                {transaction.name}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {isIncome ? (
                <TrendingUp className="w-4 h-4 text-habit" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-xs text-muted-foreground">
                {transaction.date}
              </span>
            </div>
            <span 
              className={cn(
                "font-semibold",
                isIncome ? "text-habit" : "text-destructive"
              )}
            >
              {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()} ₽
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
