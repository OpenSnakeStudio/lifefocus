import { User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from '@/contexts/LanguageContext';

export default function Profile() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PageHeader 
          showTitle
          icon={<User className="w-5 h-5 text-muted-foreground" />}
          iconBgClass="bg-muted"
          title={t('profile')}
          subtitle={t('profileSettings')}
        />

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('guest')}</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {t('profileDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
