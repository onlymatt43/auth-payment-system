'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/use-i18n';
import { InactivityLogout } from '@/components/InactivityLogout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InactivityLogout />
      <I18nProvider>{children}</I18nProvider>
    </SessionProvider>
  );
}
