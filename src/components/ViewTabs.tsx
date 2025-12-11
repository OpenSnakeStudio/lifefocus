import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Calendar, TrendingUp } from 'lucide-react';

export type ViewType = 'habits' | 'calendar' | 'progress';

interface ViewTabsProps {
  value: ViewType;
  onValueChange: (value: ViewType) => void;
}

export function ViewTabs({ value, onValueChange }: ViewTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ViewType)} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-10">
        <TabsTrigger value="habits" className="text-xs gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          Привычки
        </TabsTrigger>
        <TabsTrigger value="calendar" className="text-xs gap-1.5">
          <Calendar className="h-4 w-4" />
          Календарь
        </TabsTrigger>
        <TabsTrigger value="progress" className="text-xs gap-1.5">
          <TrendingUp className="h-4 w-4" />
          Прогресс
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
