import { useEffect, useState } from 'react';

type Language = 'en' | 'fr';

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

// Load translations
const translations: Record<Language, any> = {
  en: {},
  fr: {},
};

// Load them synchronously
try {
  const enJson = require('@/locales/en.json');
  const frJson = require('@/locales/fr.json');
  translations.en = enJson;
  translations.fr = frJson;
} catch (e) {
  console.error('Error loading translations:', e);
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'stamps.firstTime.title')
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, prop) => current?.[prop] ?? path, obj);
}

/**
 * Translate and interpolate string with replacements
 * Example: t('stamps.jackpot.message', { points: 250 })
 * => "You hit the jackpot! 250 points!"
 */
export function useI18n(): I18nContextType {
  const [locale, setLocaleState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Language | null;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Language) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[locale], key);

    // If not found in current locale, try English as fallback
    if (!value || value === key) {
      value = getNestedValue(translations.en, key);
    }

    // Replace placeholders {key}
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }

    return value || key;
  };

  return { locale: mounted ? locale : 'en', setLocale, t };
}

/**
 * Simple hook to get t() function without locale state
 */
export function useT() {
  const { locale, t } = useI18n();
  return t;
}
