'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { spinSlots } from '@/lib/slots';
import { useI18n } from '@/lib/use-i18n';
import { useStamp, StampContainer } from '@/components/Stamp';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandBanner } from '@/components/BrandBanner';

export const dynamic = 'force-dynamic';

interface SpinResult {
  success: boolean;
  result?: number;
  reels?: string[];
  multiplier?: number;
  isJackpot?: boolean;
  newBalance?: number;
  error?: string;
}

const REEL_ICONS = ['🍁', '4', '3'];
const PAID_SPIN_COST = 10;

export default function SlotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const { stamps, addStamp, removeStamp } = useStamp();
  const firstLoadRef = useRef(true);

  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['4', '3', '4']);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [balance, setBalance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [nextFreeSpinTime, setNextFreeSpinTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchBalance();
    checkFreeSpinStatus();
  }, [session?.user?.email]);

  useEffect(() => {
    if (!firstLoadRef.current || !session?.user?.email) return;

    firstLoadRef.current = false;
    addStamp({
      type: 'custom',
      title: t('stamps.slots.welcome.title'),
      message: t('stamps.slots.welcome.message'),
      emoji: '🎰',
    });
  }, [session?.user?.email, addStamp, t]);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }

  async function checkFreeSpinStatus() {
    try {
      const res = await fetch('/api/slots/check-free-spin');
      const data = await res.json();

      if (data.canSpin) {
        setNextFreeSpinTime(null);
        return;
      }

      setNextFreeSpinTime(new Date(data.nextSpinTime));
    } catch (error) {
      console.error('Failed to check free spin status:', error);
    }
  }

  async function handleSpin(payWithPoints = false) {
    if (isSpinning) return;

    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }

    if (payWithPoints && balance < PAID_SPIN_COST) {
      addStamp({
        type: 'custom',
        title: t('stamps.slots.insufficientPoints.title'),
        message: t('stamps.slots.insufficientPoints.message', {
          need: PAID_SPIN_COST,
          have: balance,
        }),
        emoji: '❌',
      });
      return;
    }

    if (!payWithPoints && nextFreeSpinTime && Date.now() < nextFreeSpinTime.getTime()) {
      const minutes = Math.ceil((nextFreeSpinTime.getTime() - Date.now()) / 60000);
      addStamp({
        type: 'custom',
        title: t('stamps.slots.freeSpinCooldown.title'),
        message: `${t('stamps.slots.freeSpinCooldown.message', { minutes })} ${t('slots.paidSpinHint', { cost: PAID_SPIN_COST })}`,
        emoji: '⏰',
      });
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    const spinAnimation = setInterval(() => {
      setReels([
        REEL_ICONS[Math.floor(Math.random() * REEL_ICONS.length)],
        REEL_ICONS[Math.floor(Math.random() * REEL_ICONS.length)],
        REEL_ICONS[Math.floor(Math.random() * REEL_ICONS.length)],
      ]);
    }, 90);

    const spinResult = await spinSlots(payWithPoints, payWithPoints ? PAID_SPIN_COST : 0);

    clearInterval(spinAnimation);

    if (spinResult.success && spinResult.reels) {
      setReels(spinResult.reels);
    }

    setResult(spinResult);
    setShowResult(true);

    if (spinResult.success) {
      if (spinResult.isJackpot) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.jackpot.title'),
          message: t('stamps.slots.jackpot.message', { points: spinResult.result }),
          emoji: '🏆',
          duration: 0,
        });
      } else if (spinResult.result && spinResult.result > 100) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.bigWin.title'),
          message: t('stamps.slots.bigWin.message', { points: spinResult.result }),
          emoji: '🎉',
        });
      } else if (spinResult.result === 0 && !payWithPoints) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.noWin.title'),
          message: t('stamps.slots.noWin.message'),
          emoji: '😅',
        });
      }

      if (spinResult.newBalance !== undefined) {
        setBalance(spinResult.newBalance);
      }

      if (!payWithPoints) {
        checkFreeSpinStatus();
      }
    } else {
      if (spinResult.error?.includes('rate limit') || spinResult.error?.includes('5 spins')) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.rateLimit.title'),
          message: t('stamps.slots.rateLimit.message'),
          emoji: '🛑',
        });
      } else {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.error.title'),
          message: spinResult.error || t('stamps.slots.error.message'),
          emoji: '⚠️',
        });
      }

      await fetchBalance();
    }

    setIsSpinning(false);
  }

  function handleProfileInfoClick() {
    if (session?.user?.email) {
      addStamp({
        type: 'custom',
        title: t('stamps.slots.profileInfo.title'),
        message: t('stamps.slots.profileInfo.messageLoggedIn', {
          email: session.user.email,
          points: balance,
        }),
      });
      return;
    }

    addStamp({
      type: 'custom',
      title: t('stamps.slots.profileInfo.title'),
      message: t('stamps.slots.profileInfo.messageGuest'),
    });
  }

  function handleLoginInfoClick() {
    if (session?.user?.email) {
      addStamp({
        type: 'custom',
        title: t('stamps.slots.loginInfo.title'),
        message: t('stamps.slots.loginInfo.messageLoggedIn', {
          email: session.user.email,
        }),
      });
      return;
    }

    addStamp({
      type: 'custom',
      title: t('stamps.slots.loginInfo.title'),
      message: t('stamps.slots.loginInfo.messageGuest'),
    });
  }


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl">🎰</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white md:px-8 md:py-12">
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/media/velvet-in-out.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <BrandBanner />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/shop"
              className="rounded-xl border border-amber-300/70 bg-amber-200/10 px-4 py-2 text-sm font-bold tracking-wide text-amber-100 hover:bg-amber-200/20"
            >
              ← {t('slots.goToShop')}
            </Link>
          </div>
        </header>

        <section
          className="relative overflow-hidden rounded-[2rem] border border-amber-200/40 bg-cover bg-center p-4 shadow-[0_0_80px_rgba(244,63,94,0.25)] md:p-8"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34, 10, 10, 0.62), rgba(34, 10, 10, 0.62)), url('/media/velvet-droit.png')",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,transparent_35%,transparent_65%,rgba(255,255,255,0.2)_100%)] opacity-40" />

          <div className="mb-6 grid grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-full rounded-full bg-amber-200"
                style={{
                  opacity: 0.45 + (i % 3) * 0.18,
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
                }}
              />
            ))}
          </div>

          <div className="mx-auto w-full max-w-2xl space-y-6">
            <div className="rounded-[1.6rem] border-4 border-amber-200/70 bg-gradient-to-b from-[#241005] to-[#120803] p-5 md:p-7">
              <button
                onClick={() => handleSpin(false)}
                disabled={isSpinning}
                className="mb-4 w-full rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-4 text-base font-black uppercase tracking-wider text-black shadow-[0_10px_30px_rgba(251,191,36,0.45)] transition hover:brightness-105 disabled:opacity-60"
              >
                {isSpinning ? `⏳ ${t('slots.spinning')}` : t('slots.spinButton')}
              </button>

              <div className="mb-4 rounded-xl border border-amber-100/20 bg-black/40 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-100/80">{t('slots.myPoints')}</p>
                <p className="mt-1 text-2xl font-black text-amber-200">
                  {session?.user?.email ? balance : t('slots.loginRequiredShort')}{' '}
                  {session?.user?.email && <span className="text-sm text-amber-100/80">{t('common.pointsAbbr')}</span>}
                </p>
              </div>

              {balance < PAID_SPIN_COST && (
                <Link
                  href="/shop"
                  className="mt-3 inline-block text-xs font-bold tracking-[0.14em] text-amber-200 hover:text-amber-100"
                >
                  → {t('slots.buyPointsLink')}
                </Link>
              )}

              <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50/90">
                <h3 className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-amber-100">{t('slots.howItWorks')}</h3>
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={handleProfileInfoClick}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/70 bg-black/40 text-amber-100 hover:bg-black/60"
                    aria-label={t('slots.profileInfoButton')}
                    title={t('slots.profileInfoButton')}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleLoginInfoClick}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/70 bg-black/40 text-amber-100 hover:bg-black/60"
                    aria-label={t('slots.loginInfoButton')}
                    title={t('slots.loginInfoButton')}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <path d="M10 17l5-5-5-5" />
                      <path d="M15 12H3" />
                    </svg>
                  </button>
                </div>
                <StampContainer
                  variant="inline"
                  stamps={stamps}
                  onRemove={removeStamp}
                  empty={
                    <ul className="space-y-1 text-xs md:text-sm">
                      <li>• {t('slots.rule1')}</li>
                      <li>• {t('slots.rule2')}</li>
                      <li>• {t('slots.rule3')}</li>
                      <li>• {t('slots.rule4')}</li>
                    </ul>
                  }
                />
              </div>
            </div>

            <div className="rounded-[1.6rem] border-4 border-amber-200/70 bg-gradient-to-b from-[#2f2720] to-[#11100d] p-5 md:p-7">
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-3 md:p-5">
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {reels.map((reel, idx) => (
                    <div
                      key={idx}
                      className={`flex h-24 items-center justify-center rounded-xl border border-zinc-500 bg-gradient-to-b from-zinc-100 to-zinc-300 text-5xl shadow-inner md:h-28 md:text-6xl ${
                        isSpinning ? 'animate-pulse' : ''
                      }`}
                    >
                      {reel}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showResult && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-200/70 bg-gradient-to-b from-[#2a1712] to-[#120905] p-8 text-center shadow-[0_0_70px_rgba(251,191,36,0.3)]">
            {result.success ? (
              <>
                <div className="mb-4 text-6xl">{result.isJackpot ? '🏆' : result.result === 0 ? '🎲' : '✨'}</div>
                <h2 className="mb-2 text-3xl font-black uppercase tracking-wide text-amber-100">{result.result === 0 ? t('slots.lost') : t('slots.won')}</h2>
                <p className="mb-4 text-2xl font-black text-amber-200">+{result.result} {t('common.pointsAbbr')}</p>
                {result.multiplier && result.multiplier > 1 && <p className="mb-2 text-zinc-300">{t('slots.multiplier')}: {result.multiplier}x</p>}
                <p className="text-zinc-300">{t('slots.newBalance')}: <span className="font-bold text-white">{result.newBalance}</span></p>
              </>
            ) : (
              <>
                <div className="mb-4 text-6xl">⚠️</div>
                <h2 className="mb-2 text-2xl font-black uppercase text-red-300">{t('slots.error')}</h2>
                <p className="text-zinc-300">{result.error}</p>
              </>
            )}

            <button
              onClick={() => setShowResult(false)}
              className="mt-8 w-full rounded-xl border border-amber-300/80 bg-amber-300/20 px-5 py-3 font-bold uppercase tracking-wide text-amber-100 hover:bg-amber-300/30"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
