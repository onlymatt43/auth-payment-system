'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getProviders, signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isNewUiEnabled } from '@/lib/feature-flags';
import { Alert, Button, Card, Input } from '@/components/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/use-i18n';
import { BrandBanner } from '@/components/BrandBanner';

type Step = 'request' | 'pending' | 'verify';

const EMAIL_HISTORY_KEY = 'onlymatt_email_login_done';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [hasEmailHistory, setHasEmailHistory] = useState(false);

  const isNewUi = isNewUiEnabled('auth');

  useEffect(() => {
    let isMounted = true;

    try {
      if (typeof window !== 'undefined' && localStorage.getItem(EMAIL_HISTORY_KEY) === '1') {
        setHasEmailHistory(true);
      }
    } catch {
      // Ignore localStorage access errors.
    }

    getProviders()
      .then((providers) => {
        if (!isMounted) return;
        setGoogleAvailable(Boolean(providers?.google));
      })
      .catch(() => {
        if (!isMounted) return;
        setGoogleAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (session?.user?.authProvider !== 'email-code') return;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EMAIL_HISTORY_KEY, '1');
      }
      setHasEmailHistory(true);
    } catch {
      // Ignore localStorage access errors.
    }
  }, [session?.user?.authProvider]);

  const allowGoogleOption = googleAvailable && hasEmailHistory;

  const rememberEmailFlow = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EMAIL_HISTORY_KEY, '1');
      }
      setHasEmailHistory(true);
    } catch {
      // Ignore localStorage access errors.
    }
  };

  const handleRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const response = await fetch('/api/auth/email/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('login.cannotGenerate'));
      }

      setStep('pending');
      if (data?.mailFallback && data?.devCode) {
        setInfo(t('login.devCode', { code: data.devCode }));
      } else {
        setInfo(t('login.sent'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!code) return;

    try {
      setLoading(true);
      setError(null);

      const result = await signIn('email-code', {
        email,
        code,
        redirect: false,
        callbackUrl: '/shop',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      rememberEmailFlow();
      router.push('/shop');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/shop' });
  };

  if (status === 'loading') {
    return (
      <main className="app-shell min-h-screen flex items-center justify-center px-6 py-10 md:px-10">
        <Card className="w-full max-w-xl text-center text-text-secondary">{t('common.loading')}</Card>
      </main>
    );
  }

  if (!isNewUi) {
    return (
      <main className="app-shell min-h-screen flex items-center justify-center px-6 py-10 md:px-10">
        <Card className="w-full max-w-xl space-y-4">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>
          <form onSubmit={handleRequestCode} className="space-y-3">
            <Input
              type="email"
              required
              label="Email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" state={loading ? 'loading' : 'idle'}>
              {t('login.continue')}
            </Button>
          </form>
          {(error || info) && <Alert tone={error ? 'danger' : 'accent'}>{error || info}</Alert>}
        </Card>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen flex items-center justify-center px-6 py-10 md:px-10">
      <div className="w-full max-w-xl space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <BrandBanner compact />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" tone="neutral" size="sm" onClick={() => router.push('/shop')}>
              ← {t('slots.goToShop')}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>

        <Card className="space-y-4">
          {!session ? (
            <>
              <Alert tone={hasEmailHistory ? 'accent' : 'brand'}>
                {hasEmailHistory ? t('login.returningHint') : t('login.firstTimeHint')}
              </Alert>

              {step === 'request' && (
                <div className="space-y-4">
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <Input
                      type="email"
                      required
                      label={t('login.step1')}
                      placeholder={t('login.enterEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="login-email-input"
                    />
                    <Button type="submit" className="w-full" size="lg" state={loading ? 'loading' : 'idle'} data-testid="login-request-code">
                      {t('login.continue')}
                    </Button>
                  </form>

                  {allowGoogleOption && (
                    <Button type="button" variant="outline" tone="neutral" className="w-full" onClick={handleGoogle} data-testid="login-google">
                      {t('login.google')}
                    </Button>
                  )}
                </div>
              )}

              {step === 'pending' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setStep('verify')}
                    className="w-full rounded-2xl border border-accent/60 bg-accent/10 px-4 py-5 text-left transition hover:border-accent hover:bg-accent/15"
                    data-testid="login-go-verify"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{t('login.messageLabel')}</p>
                    <p className="mt-2 text-text-primary">{t('login.messageBody')}</p>
                    <p className="mt-1 text-sm text-text-secondary">{t('login.messageAction')}</p>
                  </button>

                  {allowGoogleOption && (
                    <Button type="button" variant="outline" tone="neutral" className="w-full" onClick={handleGoogle} data-testid="login-google">
                      {t('login.google')}
                    </Button>
                  )}
                </div>
              )}

              {step === 'verify' && (
                <div className="space-y-4">
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <Input
                      type="text"
                      required
                      label={t('login.step2')}
                      placeholder={t('login.enterCode')}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="text-center text-2xl tracking-[0.25em]"
                      data-testid="login-code-input"
                    />
                    <Button type="submit" tone="accent" className="w-full" size="lg" state={loading ? 'loading' : 'idle'} data-testid="login-verify-code">
                      {t('login.signIn')}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="w-full text-sm text-text-muted hover:text-text-primary"
                    >
                      {t('login.useOtherEmail')}
                    </button>
                  </form>

                  {allowGoogleOption && (
                    <Button type="button" variant="outline" tone="neutral" className="w-full" onClick={handleGoogle} data-testid="login-google">
                      {t('login.google')}
                    </Button>
                  )}
                </div>
              )}

              {(error || info) && <Alert tone={error ? 'danger' : 'accent'}>{error || info}</Alert>}
            </>
          ) : session.user.authProvider === 'google' ? (
            <div className="space-y-4">
              <Alert tone="accent">{t('login.googleConnectedHint', { email: session.user.email || '' })}</Alert>
              <Button type="button" tone="danger" className="w-full" onClick={() => signOut({ callbackUrl: '/login' })}>
                {t('login.logout')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert tone="brand">{t('login.emailConnectedHint', { email: session.user.email || '' })}</Alert>
              <p className="text-sm text-text-secondary">{t('login.googleAfterEmailHint')}</p>
              {googleAvailable ? (
                <Button type="button" tone="accent" className="w-full" onClick={handleGoogle} data-testid="login-google">
                  {t('login.google')}
                </Button>
              ) : (
                <Alert tone="danger">{t('login.googleUnavailable')}</Alert>
              )}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
