'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isNewUiEnabled } from '@/lib/feature-flags';
import { AuthLayout } from '@/components/layouts';
import { Alert, Badge, Button, Card, Input } from '@/components/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/use-i18n';

type Step = 'request' | 'pending' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  const isNewUi = isNewUiEnabled('auth');

  useEffect(() => {
    let isMounted = true;
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

  const subtleGoogle = googleAvailable ? (
    <button
      type="button"
      onClick={handleGoogle}
      className="mx-auto block text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
    >
      {t('login.google')}
    </button>
  ) : null;

  if (!isNewUi) {
    return (
      <main className="app-shell min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-border-default bg-surface p-8">
          <h1 className="font-display text-3xl font-black text-text-primary">{t('login.title')}</h1>
          <form onSubmit={handleRequestCode} className="mt-6 space-y-3">
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
          {(error || info) && (
            <div className="mt-4">
              <Alert tone={error ? 'danger' : 'accent'}>{error || info}</Alert>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">{t('login.badge')}</Badge>
          <LanguageSwitcher />
        </div>
        <h1 className="text-center font-display text-4xl font-black uppercase tracking-tight text-text-primary">{t('login.title')}</h1>

        <Card className="space-y-4">
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
                />
                <Button type="submit" className="w-full" size="lg" state={loading ? 'loading' : 'idle'}>
                  {t('login.continue')}
                </Button>
              </form>
            </div>
          )}

          {step === 'pending' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="w-full rounded-2xl border border-accent/60 bg-accent/10 px-4 py-5 text-left transition hover:border-accent hover:bg-accent/15"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{t('login.messageLabel')}</p>
                <p className="mt-2 text-text-primary">{t('login.messageBody')}</p>
                <p className="mt-1 text-sm text-text-secondary">{t('login.messageAction')}</p>
              </button>
              {subtleGoogle}
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
                />
                <Button type="submit" tone="accent" className="w-full" size="lg" state={loading ? 'loading' : 'idle'}>
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
              {subtleGoogle}
            </div>
          )}

          {(error || info) && <Alert tone={error ? 'danger' : 'accent'}>{error || info}</Alert>}
        </Card>
      </div>
    </AuthLayout>
  );
}
