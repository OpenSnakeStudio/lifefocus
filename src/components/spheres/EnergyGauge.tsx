import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnergyGaugeProps {
  value: number;
  type: 'personal' | 'social';
  label?: string;
}

export function EnergyGauge({ value, type, label }: EnergyGaugeProps) {
  const { language } = useLanguage();
  
  const defaultLabels = {
    personal: {
      ru: 'Внутренняя энергия',
      en: 'Inner Energy',
      es: 'Energía Interior',
    },
    social: {
      ru: 'Внешний успех',
      en: 'External Success',
      es: 'Éxito Externo',
    },
  };

  const displayLabel = label || defaultLabels[type][language];
  
  // Colors based on type
  const colors = type === 'personal' 
    ? {
        gradient: 'from-orange-400 via-rose-400 to-purple-400',
        bg: 'bg-orange-100 dark:bg-orange-950/30',
      }
    : {
        gradient: 'from-blue-500 via-teal-400 to-emerald-400',
        bg: 'bg-blue-100 dark:bg-blue-950/30',
      };

  const height = 140;
  const fillHeight = (value / 100) * height;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground text-center max-w-16">
        {displayLabel}
      </span>
      
      <div 
        className={`relative w-6 rounded-full overflow-hidden ${colors.bg}`}
        style={{ height }}
      >
        {/* Fill */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colors.gradient} rounded-full`}
          initial={{ height: 0 }}
          animate={{ height: fillHeight }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-1">
          {[100, 75, 50, 25, 0].map((mark) => (
            <div 
              key={mark} 
              className="w-full h-px bg-background/30"
            />
          ))}
        </div>
      </div>
      
      <motion.span 
        className="text-lg font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {value}%
      </motion.span>
    </div>
  );
}
