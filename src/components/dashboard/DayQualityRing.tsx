import { motion } from 'framer-motion';

interface DayQualityRingProps {
  value: number; // 0-100
  size?: number;
}

function getQualityColor(value: number): string {
  if (value <= 20) return 'hsl(0, 70%, 50%)'; // red
  if (value <= 40) return 'hsl(30, 90%, 50%)'; // orange
  if (value <= 60) return 'hsl(50, 90%, 50%)'; // yellow
  if (value <= 80) return 'hsl(145, 70%, 45%)'; // green
  if (value <= 90) return 'hsl(200, 80%, 50%)'; // cyan
  if (value < 100) return 'hsl(220, 80%, 55%)'; // blue
  return 'hsl(262, 80%, 55%)'; // purple (100%)
}

function getContrastColor(value: number): string {
  // White text for darker colors, dark text for yellow
  if (value <= 20) return 'white'; // red
  if (value <= 40) return 'white'; // orange
  if (value <= 60) return 'hsl(0, 0%, 15%)'; // yellow - dark text
  if (value <= 80) return 'white'; // green
  if (value <= 90) return 'white'; // cyan
  if (value < 100) return 'white'; // blue
  return 'white'; // purple
}

export function DayQualityRing({ value, size = 84 }: DayQualityRingProps) {
  const color = getQualityColor(value);
  const textColor = getContrastColor(value);

  return (
    <motion.div 
      className="flex items-center justify-center rounded-full shadow-lg"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: color 
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <span 
        className="text-xl font-bold"
        style={{ color: textColor }}
      >
        {value}
      </span>
    </motion.div>
  );
}
