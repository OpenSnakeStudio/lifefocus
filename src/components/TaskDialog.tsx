import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Task, TASK_ICONS, TASK_COLORS } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  task?: Task | null;
}

export function TaskDialog({ open, onClose, onSave, task }: TaskDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(TASK_ICONS[0]);
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { t } = useTranslation();

  useEffect(() => {
    if (task) {
      setName(task.name);
      setIcon(task.icon);
      setColor(task.color);
      setDueDate(task.dueDate);
      setPriority(task.priority);
    } else {
      setName('');
      setIcon(TASK_ICONS[0]);
      setColor(TASK_COLORS[0]);
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority('medium');
    }
  }, [task, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, dueDate, priority });
    onClose();
  };

  const priorities: Array<{ value: 'low' | 'medium' | 'high'; label: string }> = [
    { value: 'low', label: t('priorityLow') },
    { value: 'medium', label: t('priorityMedium') },
    { value: 'high', label: t('priorityHigh') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-3xl p-6 shadow-lg z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {task ? t('editTask') : t('newTask')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('taskName')}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('taskNamePlaceholder')}
                className="bg-background border-border"
              />
            </div>

            {/* Due Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('dueDate')}
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            {/* Priority */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('priority')}
              </label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                      priority === p.value
                        ? "bg-task text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('icon')}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {TASK_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                      icon === i
                        ? "bg-task/20 ring-2 ring-task"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('color')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color === c && "ring-2 ring-offset-2 ring-offset-card ring-task"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full bg-task hover:bg-task/90 text-white"
            >
              {t('save')}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
