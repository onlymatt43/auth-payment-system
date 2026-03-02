'use client';

import { useI18n } from '@/lib/use-i18n';

/**
 * Language Switcher Component
 * Simple button to toggle between English and French
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-lg text-sm font-bold transition ${
          locale === 'en'
            ? 'bg-neon-yellow text-dark-navy'
            : 'bg-dark-blue text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('fr')}
        className={`px-3 py-1 rounded-lg text-sm font-bold transition ${
          locale === 'fr'
            ? 'bg-neon-pink text-white'
            : 'bg-dark-blue text-gray-400 hover:text-white'
        }`}
      >
        FR
      </button>
    </div>
  );
}
