import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type Period = '7' | '14' | '30';

interface PeriodSelectorProps {
  value: Period;
  onValueChange: (value: Period) => void;
}

export function PeriodSelector({ value, onValueChange }: PeriodSelectorProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onValueChange(v as Period)}>
      <ToggleGroupItem value="7" size="sm" className="text-xs">
        7 дней
      </ToggleGroupItem>
      <ToggleGroupItem value="14" size="sm" className="text-xs">
        14 дней
      </ToggleGroupItem>
      <ToggleGroupItem value="30" size="sm" className="text-xs">
        Месяц
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
