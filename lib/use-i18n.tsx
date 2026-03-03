"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'fr';

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en: {},
  fr: {},
};

try {
  const enJson = require('@/locales/en.json');
  const frJson = require('@/locales/fr.json');
  translations.en = enJson;
  translations.fr = frJson;
} catch (error) {
  console.error('Error loading translations:', error);
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, prop) => current?.[prop] ?? path, obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Language>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('locale') as Language | null;
    if (saved === 'en' || saved === 'fr') {
      setLocaleState(saved);
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Language) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', newLocale);
    }
  }, []);

  const translate = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      let value = getNestedValue(translations[locale], key);

      if (!value || value === key) {
        value = getNestedValue(translations.en, key);
      }

      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }

      return value || key;
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale: hydrated ? locale : 'en',
      setLocale,
      t: translate,
    }),
    [locale, setLocale, translate, hydrated]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useT() {
  const { t } = useI18n();
  return t;
}
