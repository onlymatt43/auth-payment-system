'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CTAButtons } from '@/components/CTAButtons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/use-i18n';
import { isNewUiEnabled } from '@/lib/feature-flags';
import { PaymentLayout, SectionHeader } from '@/components/layouts';
import { Alert, Button, Card, Skeleton } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface PointPackage {
  id: number;
  name: string;
  points: number;
  price_usd: number;
  active: boolean;
}

interface UserBalance {
  email: string;
  balance: number;
  total_spent: number;
  total_earned: number;
  recent_transactions: Array<{
    type: string;
    amount: number;
    balance_after: number;
    created_at: string;
  }>;
}

export default function ShopPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useI18n();

  const isNewUi = isNewUiEnabled('payment');

  useEffect(() => {
    loadData();
  }, [session]);

  const activePackages = useMemo(() => packages.filter((pkg) => pkg.active), [packages]);

  const formatUsd = (value?: number | null) => `$${(value ?? 0).toFixed(2)}`;

  async function loadData() {
    try {
      setErrorMessage(null);
      const pkgRes = await fetch('/api/packages');
      const pkgData = await pkgRes.json();
      setPackages(pkgData.packages || []);

      if (session?.user?.email) {
        const balanceRes = await fetch('/api/balance');
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setErrorMessage('Unable to load package data right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(packageId: number) {
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    setPurchasing(packageId);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId }),
      });

      const data = await res.json();

      if (data.success && data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        setErrorMessage(data.error || 'Payment session could not be created.');
        setPurchasing(null);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setErrorMessage('Purchase failed. Please retry.');
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <PaymentLayout>
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      </PaymentLayout>
    );
  }

  if (!isNewUi) {
    return (
      <main className="app-shell min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-border-default bg-surface p-6">
            <div>
              <h1 className="font-display text-4xl font-black text-text-primary">Shop</h1>
              <p className="text-text-secondary">Legacy fallback mode via feature flag.</p>
            </div>
            <LanguageSwitcher />
          </div>
          {activePackages.map((pkg) => (
            <div key={pkg.id} className="rounded-3xl border border-border-default bg-surface p-6">
              <div className="flex items-center justify-between">
                <p className="text-text-primary">{pkg.name} - {pkg.points} pts</p>
                <Button onClick={() => handlePurchase(pkg.id)} disabled={!session || purchasing === pkg.id}>
                  {purchasing === pkg.id ? '...' : formatUsd(pkg.price_usd)}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <PaymentLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {session?.user?.email ? (
            <p className="text-sm text-text-secondary break-all">{session.user.email}</p>
          ) : (
            <p className="text-sm text-text-muted" data-testid="shop-login-reminder">{t('shop.loginReminder')}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" tone="neutral" size="sm" onClick={() => router.push('/login')} data-testid="shop-login-button">
              Log in
            </Button>
            <LanguageSwitcher />
          </div>
        </header>

        {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeader title={t('shop.packages')} />
          </div>

          {activePackages.length ? (
            <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2">
              {activePackages.map((pkg) => (
                <Card key={pkg.id} className="min-w-[320px] snap-start border-border-default md:min-w-[380px]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-text-muted">{pkg.name}</p>
                      <p className="mt-2 font-display text-4xl font-black text-text-primary">{pkg.points} {t('common.pointsAbbr')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl font-black text-brand">{formatUsd(pkg.price_usd)}</p>
                      <p className="text-xs text-text-muted">~ ${(pkg.price_usd / pkg.points).toFixed(2)} {t('shop.value_per_point')}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="mt-6 w-full"
                    size="lg"
                    disabled={!session || purchasing === pkg.id}
                    onClick={() => handlePurchase(pkg.id)}
                    data-testid={`package-cta-${pkg.id}`}
                    state={purchasing === pkg.id ? 'loading' : 'idle'}
                  >
                    {session ? t('shop.buyWithPayPal') : t('shop.loginToBuy')}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center text-text-muted">{t('shop.packagesUnavailable')}</Card>
          )}
        </section>

        <section className="animate-fade-in-up">
          <div className="mt-4">
            <CTAButtons />
          </div>
        </section>
      </div>
    </PaymentLayout>
  );
}
