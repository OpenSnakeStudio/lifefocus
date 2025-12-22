import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { useTranslation } from '@/contexts/LanguageContext';

export function TimeStatsWidgetCompact() {
  const { t } = useTranslation();
  const { getTodayTotalTime, formatDuration } = useTimeTracker();

  const todayTotal = getTodayTotalTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl p-2 shadow-card border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-task" />
          <span className="font-medium text-[10px]">{t('timeSpent') || 'Учёт времени'}</span>
        </div>
      </div>

      {/* Today only */}
      <div className="flex items-center gap-2">
        <div className="bg-muted/50 rounded-lg p-2 flex-1 text-center">
          <div className="text-lg font-bold text-foreground">
            {formatDuration(todayTotal)}
          </div>
          <div className="text-[9px] text-muted-foreground">{t('today') || 'Сегодня'}</div>
        </div>
      </div>
    </motion.div>
  );
}
