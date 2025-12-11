import { useState, useEffect, useCallback } from 'react';
import { Language, translations, TranslationKey } from '@/i18n/translations';

const STORAGE_KEY = 'habitflow-language';

function getSystemLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ru') return 'ru';
  if (browserLang === 'es') return 'es';
  return 'en';
}

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'ru' || stored === 'en' || stored === 'es')) {
    return stored;
  }
  return getSystemLanguage();
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key];
  }, [language]);

  const getLocale = useCallback(() => {
    const locales: Record<Language, string> = {
      ru: 'ru-RU',
      en: 'en-US',
      es: 'es-ES',
    };
    return locales[language];
  }, [language]);

  return { language, setLanguage, t, getLocale };
}
