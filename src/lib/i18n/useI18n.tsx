'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { defaultLocale } from '@/lib/i18n/config';

interface Language {
  code: string;
  name: string;
  flag: string | null;
  isDefault: boolean;
}

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  languages: Language[];
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale');
      if (saved) return saved;
    }
    return defaultLocale;
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available languages
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
          
          // If current locale is not in available languages, fallback to default
          if (data.length > 0 && !data.find((l: Language) => l.code === locale)) {
            const defaultLang = data.find((l: Language) => l.isDefault) || data[0];
            setLocaleState(defaultLang.code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    }
    fetchLanguages();
  }, [locale]);

  // Fetch translations when locale changes
  useEffect(() => {
    async function fetchTranslations() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/translations?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to fetch translations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTranslations();
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      // Direct lookup in flattened object
      if (translations[key]) {
        return translations[key];
      }
      
      // Return key if not found
      return key;
    },
    [translations]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
