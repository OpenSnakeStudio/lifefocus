import { format, addDays, addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

export type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface Period {
  type: PeriodType;
  startDate: string;
  endDate: string;
}

export function getPeriodDates(type: PeriodType, customStart?: string, customEnd?: string): { startDate: string; endDate: string } {
  const today = new Date();
  
  switch (type) {
    case 'week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'quarter':
      return {
        startDate: format(startOfQuarter(today), 'yyyy-MM-dd'),
        endDate: format(endOfQuarter(today), 'yyyy-MM-dd'),
      };
    case 'year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(endOfYear(today), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        startDate: customStart || format(today, 'yyyy-MM-dd'),
        endDate: customEnd || format(addDays(today, 30), 'yyyy-MM-dd'),
      };
  }
}

export function getPeriodLabel(type: PeriodType, language: string): string {
  const isRussian = language === 'ru';
  switch (type) {
    case 'week': return isRussian ? 'Неделя' : 'Week';
    case 'month': return isRussian ? 'Месяц' : 'Month';
    case 'quarter': return isRussian ? 'Квартал' : 'Quarter';
    case 'year': return isRussian ? 'Год' : 'Year';
    case 'custom': return isRussian ? 'Свой период' : 'Custom';
  }
}

export function formatPeriodRange(startDate: string, endDate: string, language: string): string {
  const locale = language === 'ru' ? ru : enUS;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${format(start, 'd MMM', { locale })} - ${format(end, 'd MMM yyyy', { locale })}`;
}

// Calculate postponed date
export function getPostponedDate(days: number): string {
  return format(addDays(new Date(), days), 'yyyy-MM-dd');
}

// Postpone options
export const POSTPONE_OPTIONS = [
  { days: 1, labelRu: 'На день', labelEn: '1 day' },
  { days: 3, labelRu: 'На 3 дня', labelEn: '3 days' },
  { days: 7, labelRu: 'На неделю', labelEn: '1 week' },
];