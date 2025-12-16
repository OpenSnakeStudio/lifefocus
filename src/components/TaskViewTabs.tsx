import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface TaskViewTabsProps {
  activeView: 'list' | 'calendar' | 'progress';
  onViewChange: (view: 'list' | 'calendar' | 'progress') => void;
}

export function TaskViewTabs({ activeView, onViewChange }: TaskViewTabsProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'list' as const, label: t('tasks') },
    { id: 'calendar' as const, label: t('calendar') },
    { id: 'progress' as const, label: t('progress') },
  ];

  return (
    <div className="flex bg-muted rounded-2xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={cn(
            "flex-1 relative py-2.5 px-4 text-sm font-medium transition-colors rounded-xl",
            activeView === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeView === tab.id && (
            <motion.div
              layoutId="task-active-tab"
              className="absolute inset-0 bg-background rounded-xl shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
