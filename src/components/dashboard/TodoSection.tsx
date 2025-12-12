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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-card border border-border shadow-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {items.filter(i => !i.completed).length}
        </span>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">
            {emptyMessage || 'Нет элементов'}
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                item.completed
                  ? "bg-muted/50 opacity-60"
                  : "bg-background hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  item.completed
                    ? "border-transparent"
                    : "border-muted-foreground/30"
                )}
                style={{ 
                  backgroundColor: item.completed ? color : 'transparent',
                }}
              >
                {item.completed && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              
              {item.icon && (
                <span className="text-sm flex-shrink-0">{item.icon}</span>
              )}
              
              <span 
                className={cn(
                  "text-sm truncate",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
