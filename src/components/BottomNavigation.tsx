import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckSquare, Wallet, Dumbbell, Plus, X } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onAddHabit: () => void;
  onAddTask: () => void;
  onAddTransaction: () => void;
  onAddWorkout: () => void;
}

export function BottomNavigation({ 
  onAddHabit, 
  onAddTask, 
  onAddTransaction, 
  onAddWorkout 
}: BottomNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/habits', icon: Target, label: t('habits'), color: 'hsl(145, 70%, 45%)' },
    { path: '/tasks', icon: CheckSquare, label: t('tasks'), color: 'hsl(200, 80%, 50%)' },
    { path: '/finance', icon: Wallet, label: t('finance'), color: 'hsl(160, 30%, 45%)' },
    { path: '/fitness', icon: Dumbbell, label: t('fitness'), color: 'hsl(262, 80%, 55%)' },
  ];

  const quickAddItems = [
    { label: t('habit'), icon: Target, color: 'hsl(145, 70%, 45%)', action: onAddHabit },
    { label: t('task'), icon: CheckSquare, color: 'hsl(200, 80%, 50%)', action: onAddTask },
    { label: t('transaction'), icon: Wallet, color: 'hsl(160, 30%, 45%)', action: onAddTransaction },
    { label: t('workout'), icon: Dumbbell, color: 'hsl(262, 80%, 55%)', action: onAddWorkout },
  ];

  const handleQuickAdd = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Add Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            {quickAddItems.map((item, index) => {
              const angle = -180 + (index * 45) + 22.5; // Arc from -180 to 0
              const radius = 80;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.button
                  key={item.label}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x, y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
                  onClick={() => handleQuickAdd(item.action)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {/* Left side items */}
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 hidden sm:block">{item.label}</span>
            </button>
          ))}

          {/* Center Add Button */}
          <div className="relative">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow -mt-6"
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Plus className="w-6 h-6 text-primary-foreground" />
              )}
            </motion.button>
            <span className="text-xs text-muted-foreground mt-1 hidden sm:block text-center absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {t('new')}
            </span>
          </div>

          {/* Right side items */}
          {navItems.slice(2, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
