import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPHERES, getSphereName, Sphere } from '@/types/sphere';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SphereSelectorProps {
  value: number | null;
  onChange: (sphereId: number) => void;
  disabled?: boolean;
  showWarning?: boolean;
  label?: string;
  required?: boolean;
}

export function SphereSelector({
  value,
  onChange,
  disabled = false,
  showWarning = false,
  label,
  required = false,
}: SphereSelectorProps) {
  const { language } = useLanguage();

  const defaultLabels = {
    ru: 'Сфера жизни',
    en: 'Life Sphere',
    es: 'Esfera de vida',
  };

  const displayLabel = label || defaultLabels[language];
  const isUncategorized = value === 0;

  // Group spheres for display
  const personalSpheres = SPHERES.filter(s => s.group_type === 'personal');
  const socialSpheres = SPHERES.filter(s => s.group_type === 'social');
  const systemSpheres = SPHERES.filter(s => s.group_type === 'system');

  const renderSphereItem = (sphere: Sphere) => (
    <SelectItem key={sphere.id} value={String(sphere.id)}>
      <div className="flex items-center gap-2">
        <span>{sphere.icon}</span>
        <span 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: sphere.color }}
        />
        <span>{getSphereName(sphere, language)}</span>
      </div>
    </SelectItem>
  );

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "flex items-center gap-2",
          isUncategorized && showWarning && "text-amber-600 dark:text-amber-400"
        )}
      >
        {displayLabel}
        {required && <span className="text-destructive">*</span>}
        {isUncategorized && showWarning && (
          <AlertTriangle className="w-4 h-4" />
        )}
      </Label>
      
      <Select
        value={value !== null ? String(value) : undefined}
        onValueChange={(val) => onChange(parseInt(val, 10))}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            isUncategorized && showWarning && "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          )}
        >
          <SelectValue placeholder={language === 'ru' ? 'Выберите сферу' : 'Select sphere'} />
        </SelectTrigger>
        <SelectContent>
          {/* System (Uncategorized) */}
          {systemSpheres.map(renderSphereItem)}
          
          {/* Separator */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
            {language === 'ru' ? 'Личное' : language === 'es' ? 'Personal' : 'Personal'}
          </div>
          
          {/* Personal spheres */}
          {personalSpheres.map(renderSphereItem)}
          
          {/* Separator */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
            {language === 'ru' ? 'Социальное' : language === 'es' ? 'Social' : 'Social'}
          </div>
          
          {/* Social spheres */}
          {socialSpheres.map(renderSphereItem)}
        </SelectContent>
      </Select>
      
      {isUncategorized && showWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {language === 'ru' 
            ? 'Рекомендуем выбрать одну из 8 сфер жизни'
            : language === 'es'
            ? 'Recomendamos elegir una de las 8 esferas de vida'
            : 'We recommend choosing one of the 8 life spheres'}
        </p>
      )}
    </div>
  );
}
