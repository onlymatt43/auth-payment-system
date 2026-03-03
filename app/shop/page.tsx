"use client";

import { useEffect, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { CTAButtons } from '@/components/CTAButtons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/use-i18n';

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
  const { data: session, status } = useSession();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    loadData();
  }, [session]);

  const activePackages = useMemo(() => packages.filter((pkg) => pkg.active), [packages]);
  const handleSignIn = () => {
    void signIn('google', { callbackUrl: '/shop' });
  };
  const formatUsd = (value?: number | null) => `$${(value ?? 0).toFixed(2)}`;

  async function loadData() {
    try {
      // Charger les packages
      const pkgRes = await fetch('/api/packages');
      const pkgData = await pkgRes.json();
      setPackages(pkgData.packages || []);

      // Charger le solde si connecté
      if (session?.user?.email) {
        const balanceRes = await fetch('/api/balance');
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(packageId: number) {
    if (!session?.user?.email) {
      signIn('google');
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
        // Rediriger vers PayPal
        window.location.href = data.approval_url;
      } else {
        alert('Erreur: ' + (data.error || 'Unknown error'));
        setPurchasing(null);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Une erreur est survenue');
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse glow-blue">⚡</div>
          <p className="text-white text-lg glow-blue">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 gap-12">
        {/* Hero */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-neon-yellow mb-4">{t('shop.ready')}</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              <span className="gradient-text">ONLYPOINT$</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">{t('shop.readyDesc')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Auth status */}
        <div className="glass-dark neon-border-blue rounded-3xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-400">{t('shop.loginReminder')}</p>
            {session ? (
              <p className="text-2xl font-bold text-white mt-2">
                {session.user?.email}
              </p>
            ) : (
              <p className="text-xl font-bold text-neon-yellow mt-2">{t('shop.connect')}</p>
            )}
          </div>
          {!session && (
            <button
              type="button"
              onClick={handleSignIn}
              className="btn-neon w-full md:w-auto"
            >
              {t('shop.connect')}
            </button>
          )}
        </div>

        {/* Balance */}
        {session && balance && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-dark rounded-2xl p-6 border border-neon-yellow/40">
              <p className="text-sm text-gray-400 mb-2">{t('shop.balance')}</p>
              <p className="text-4xl font-black glow-yellow">{balance.balance} {t('common.pointsAbbr')}</p>
            </div>
            <div className="glass-dark rounded-2xl p-6 border border-neon-pink/40">
              <p className="text-sm text-gray-400 mb-2">{t('shop.totalBought')}</p>
              <p className="text-4xl font-black text-neon-pink">{formatUsd(balance.total_spent)}</p>
            </div>
            <div className="glass-dark rounded-2xl p-6 border border-neon-blue/40">
              <p className="text-sm text-gray-400 mb-2">{t('shop.howItWorks')}</p>
              <p className="text-lg text-gray-300">{t('shop.purchaseIntro')}</p>
            </div>
          </div>
        )}

        {/* Packages */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-neon-blue text-sm uppercase tracking-[0.3em]">{t('shop.packages')}</p>
              <h2 className="text-3xl font-black">{t('shop.purchaseIntro')}</h2>
            </div>
            {status === 'authenticated' && (
              <span className="text-sm text-gray-400">
                {activePackages.length} {t('shop.packages').toLowerCase()}
              </span>
            )}
          </div>

          {activePackages.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {activePackages.map((pkg) => (
                <div key={pkg.id} className="glass-dark rounded-3xl p-8 border border-white/10 hover-lift">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-400">{pkg.name}</p>
                      <p className="text-4xl font-black text-white">{pkg.points} {t('common.pointsAbbr')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-neon-yellow">{formatUsd(pkg.price_usd)}</p>
                      <p className="text-xs text-gray-500">
                        ~ ${(pkg.price_usd / pkg.points).toFixed(2)} {t('shop.value_per_point')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!session || purchasing === pkg.id}
                    onClick={() => handlePurchase(pkg.id)}
                    className={`w-full py-3 rounded-2xl font-bold transition-colors ${
                      session
                        ? 'btn-neon'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } ${purchasing === pkg.id ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    {session
                      ? purchasing === pkg.id
                        ? '...'
                        : t('shop.buyWithPayPal')
                      : t('shop.loginToBuy')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-dark rounded-3xl p-12 text-center text-gray-400">
              {t('shop.packagesUnavailable')}
            </div>
          )}
        </section>

        {/* Secondary CTAs */}
        <div className="glass-dark rounded-3xl p-8 border border-white/5">
          <p className="text-center text-sm text-gray-400 mb-6">Need more options?</p>
          <CTAButtons />
        </div>
      </div>
    </main>
  );
}
