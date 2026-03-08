'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/use-i18n';

function classFor(active: boolean) {
  return active
    ? 'border-brand bg-brand text-ink shadow-glow'
    : 'border-border-strong bg-surface-elevated text-text-primary hover:border-brand/70';
}

const LOCALE_LOCK_KEY = 'locale_locked';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const isLocked = window.localStorage.getItem(LOCALE_LOCK_KEY) === 'true';
    setLocked(isLocked);
    setReady(true);
  }, []);

  const chooseLocale = (value: 'en' | 'fr') => {
    setLocale(value);
    window.localStorage.setItem(LOCALE_LOCK_KEY, 'true');
    setLocked(true);
  };

  if (!ready || locked) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border-default bg-surface/90 p-1.5">
      <button
        type="button"
        className={`h-11 min-w-[52px] rounded-lg border px-3 text-xs font-extrabold tracking-[0.08em] transition ${classFor(locale === 'en')}`}
        onClick={() => chooseLocale('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`h-11 min-w-[52px] rounded-lg border px-3 text-xs font-extrabold tracking-[0.08em] transition ${classFor(locale === 'fr')}`}
        onClick={() => chooseLocale('fr')}
      >
        FR
      </button>
    </div>
  );
}
