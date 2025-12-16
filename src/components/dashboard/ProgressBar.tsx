import { motion } from 'framer-motion';

interface ProgressBarProps {
  icon: React.ReactNode;
  completed: number;
  total: number;
  label: string;
  color: string;
}

export function ProgressBar({ icon, completed, total, label, color }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      
      <span className="text-sm font-medium text-foreground w-10 flex-shrink-0">
        {completed}/{total}
      </span>
      
      <div className="flex-1 relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      
      <span className="text-sm text-muted-foreground w-16 flex-shrink-0">
        {label}
      </span>
      
      <span 
        className="text-sm font-semibold w-12 text-right flex-shrink-0"
        style={{ color }}
      >
        {percentage}%
      </span>
    </div>
  );
}
