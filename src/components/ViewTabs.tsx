import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Calendar, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export type ViewType = 'habits' | 'calendar' | 'progress';

interface ViewTabsProps {
  value: ViewType;
  onValueChange: (value: ViewType) => void;
}

export function ViewTabs({ value, onValueChange }: ViewTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ViewType)} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-10">
        <TabsTrigger value="habits" className="text-xs gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          {t('habits')}
        </TabsTrigger>
        <TabsTrigger value="calendar" className="text-xs gap-1.5">
          <Calendar className="h-4 w-4" />
          {t('calendar')}
        </TabsTrigger>
        <TabsTrigger value="progress" className="text-xs gap-1.5">
          <TrendingUp className="h-4 w-4" />
          {t('progress')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
