'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
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

// Default languages fallback
const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', isDefault: true },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹', isDefault: false },
  { code: 'or', name: 'Afaan Oromoo', flag: '🇪🇹', isDefault: false },
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(defaultLocale);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  // Fetch available languages - only once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setLanguages(data);
            // Set default language from server
            const defaultLang = data.find((l: Language) => l.isDefault) || data[0];
            setLocaleState(defaultLang.code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Keep default languages on error
      }
    }
    fetchLanguages();
  }, []);

  // Fetch translations when locale changes
  useEffect(() => {
    let cancelled = false;
    
    async function fetchTranslations() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/translations?locale=${locale}`);
        if (response.ok && !cancelled) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to fetch translations:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    fetchTranslations();
    
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (translations[key]) {
        return translations[key];
      }
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
