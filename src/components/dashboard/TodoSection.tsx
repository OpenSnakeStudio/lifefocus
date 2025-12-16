import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoItem {
  id: string;
  name: string;
  icon?: string;
  completed: boolean;
}

interface TodoSectionProps {
  title: string;
  items: TodoItem[];
  color: string;
  icon: React.ReactNode;
  onToggle: (id: string) => void;
  emptyMessage?: string;
}

export function TodoSection({ title, items, color, icon, onToggle, emptyMessage }: TodoSectionProps) {
  // Filter to show only incomplete items
  const incompleteItems = items.filter(i => !i.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 shadow-card border border-border/30"
      style={{ backgroundColor: `${color}25` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}40` }}
        >
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-background/50 text-foreground">
          {incompleteItems.length}
        </span>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {incompleteItems.length === 0 ? (
          <p className="text-xs text-foreground/70 py-2 text-center">
            {emptyMessage || '✓'}
          </p>
        ) : (
          incompleteItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                "bg-background/40 hover:bg-background/60"
              )}
            >
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors border-foreground/30"
              >
                {item.completed && (
                  <Check className="w-3 h-3 text-foreground" />
                )}
              </div>
              
              {item.icon && (
                <span className="text-sm flex-shrink-0">{item.icon}</span>
              )}
              
              <span className="text-sm truncate text-foreground">
                {item.name}
              </span>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
