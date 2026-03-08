"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import enJson from '@/locales/en.json';
import frJson from '@/locales/fr.json';

type Language = 'en' | 'fr';

type Dictionary = Record<string, any>;

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Dictionary> = {
  en: enJson as Dictionary,
  fr: frJson as Dictionary,
};

function getNestedValue(obj: Dictionary, path: string): string {
  const value = path.split('.').reduce<any>((current, prop) => current?.[prop], obj);
  return typeof value === 'string' ? value : path;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Language>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('locale') as Language | null;
    if (saved === 'en' || saved === 'fr') {
      setLocaleState(saved);
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Language) => {
    setLocaleState(newLocale);
    window.localStorage.setItem('locale', newLocale);
  }, []);

  const translate = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      let value = getNestedValue(translations[locale], key);

      if (!value || value === key) {
        value = getNestedValue(translations.en, key);
      }

      if (replacements) {
        for (const [k, v] of Object.entries(replacements)) {
          value = value.replace(`{${k}}`, String(v));
        }
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
    [hydrated, locale, setLocale, translate]
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
