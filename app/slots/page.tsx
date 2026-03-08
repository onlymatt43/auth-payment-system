'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { spinSlots } from '@/lib/slots';
import { useI18n } from '@/lib/use-i18n';
import { useStamp, StampContainer } from '@/components/Stamp';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useDeviceMotion, getMotionTransform } from '@/lib/use-device-motion';
import { MotionEffects } from '@/components/MotionEffects';

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

export default function SlotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();  const { t } = useI18n();
  const { stamps, addStamp, removeStamp } = useStamp();
  const { normalizedX, normalizedY } = useDeviceMotion();
  const firstLoadRef = useRef(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🎪', '🎪', '🎪']);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [balance, setBalance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [canPayWithPoints, setCanPayWithPoints] = useState(false);
  const [pointsCost, setPointsCost] = useState(10);
  const [nextFreeSpinTime, setNextFreeSpinTime] = useState<Date | null>(null);
  const [rateLimitData, setRateLimitData] = useState<{ remaining: number; resetTime: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load user balance and check free spin eligibility
  useEffect(() => {
    if (session?.user?.email) {
      fetchBalance();
      checkFreeSpinStatus();
    }
  }, [session]);

  // Track mouse position for desktop hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show welcome stamp on first load
  useEffect(() => {
    if (firstLoadRef.current && session?.user?.email) {
      firstLoadRef.current = false;
      addStamp({
        type: 'custom',
        title: t('stamps.slots.welcome.title'),
        message: t('stamps.slots.welcome.message'),
        emoji: '🎰',
      });
    }
  }, [session?.user?.email, addStamp, t]);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      setBalance(data.points || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }

  async function checkFreeSpinStatus() {
    try {
      const res = await fetch('/api/slots/check-free-spin');
      const data = await res.json();
      
      if (!data.canSpin) {
        setNextFreeSpinTime(new Date(data.nextSpinTime));
      }
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

    // Check if user has enough points for paid spin
    if (payWithPoints && balance < pointsCost) {
      addStamp({
        type: 'custom',
        title: t('stamps.slots.insufficientPoints.title'),
        message: t('stamps.slots.insufficientPoints.message', {
          need: pointsCost,
          have: balance,
        }),
        emoji: '❌',
      });
      return;
    }

    // Check if user can do free spin
    if (!payWithPoints && nextFreeSpinTime && new Date() < nextFreeSpinTime) {
      const timeUntil = Math.ceil((nextFreeSpinTime.getTime() - new Date().getTime()) / 1000 / 60);
      addStamp({
        type: 'custom',
        title: t('stamps.slots.freeSpinCooldown.title'),
        message: t('stamps.slots.freeSpinCooldown.message', { minutes: timeUntil }),
        emoji: '⏰',
      });
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    // Animate reels spinning
    const spinAnimation = setInterval(() => {
      const possibleReels = ['🍒', '💎', '👑', '🎯', '🎪'];
      setReels([
        possibleReels[Math.floor(Math.random() * possibleReels.length)],
        possibleReels[Math.floor(Math.random() * possibleReels.length)],
        possibleReels[Math.floor(Math.random() * possibleReels.length)],
      ]);
    }, 100);

    // Call server action directly
    const spinResult = await spinSlots(payWithPoints, payWithPoints ? pointsCost : 0);

    // Stop animation
    clearInterval(spinAnimation);

    // Set final reels
    if (spinResult.success && spinResult.reels) {
      setReels(spinResult.reels);
    }

    setResult(spinResult);
    setShowResult(true);

    // Show contextual stamp based on result
    if (spinResult.success) {
      if (spinResult.isJackpot) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.jackpot.title'),
          message: t('stamps.slots.jackpot.message', { points: spinResult.result }),
          emoji: '🏆',
          duration: 0, // Persistent
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

      // Update balance if successful
      if (spinResult.newBalance !== undefined) {
        setBalance(spinResult.newBalance);
      }

      // Update free spin status
      if (!payWithPoints) {
        checkFreeSpinStatus();
      }
    } else {
      // Handle errors with stamps
      if (spinResult.error?.includes('rate limit') || spinResult.error?.includes('5 spins')) {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.rateLimit.title'),
          message: t('stamps.slots.rateLimit.message'),
          emoji: '🛑',
        });
        // Parse rate limit info from error if available
        const match = spinResult.error?.match(/(\d+) remaining/);
        if (match) {
          setRateLimitData({ remaining: parseInt(match[1]), resetTime: 'in 1 hour' });
        }
      } else {
        addStamp({
          type: 'custom',
          title: t('stamps.slots.error.title'),
          message: spinResult.error || t('stamps.slots.error.message'),
          emoji: '⚠️',
        });
      }

      // Refetch balance on error to ensure sync
      await fetchBalance();
    }

    setIsSpinning(false);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-4xl glow-blue">⚡</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center p-6">
        <div className="neon-border-yellow glass-dark rounded-3xl p-12 text-center">
          <p className="text-gray-400 mb-8">{t('slots.notSignedIn')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <MotionEffects />
      <div className="max-w-2xl mx-auto">
        {/* Header with Language Switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div className="flex items-center gap-3 md:justify-end">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue mb-12"></div>

        {/* Balance Display */}
        <div className="neon-border-yellow glass-dark rounded-3xl p-8 mb-12 hover-lift hover-glow animate-float">
          <div className="text-center">
            <p className="text-neon-yellow text-xs tracking-widest font-bold mb-2 animate-twinkle">{t('common.balance')}</p>
            <p className="text-5xl font-black glow-yellow">{balance}</p>
            <p className="text-gray-400 text-sm mt-2">{t('common.pointsLabel')}</p>
          </div>
        </div>

        {/* Free Spin Status */}
        {nextFreeSpinTime && (
          <div className="neon-border-blue glass-dark rounded-3xl p-4 mb-8 text-sm">
            <p className="text-neon-blue">
              ⏰ {t('slots.freeSpinAvailable')}
            </p>
          </div>
        )}

        {/* Slot Machine */}
        <div className="neon-border-pink glass-dark rounded-3xl p-8 mb-12 hover-lift">
          {/* Reels */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-neon-blue/40">
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source src="https://vz-72668a20-6b9.b-cdn.net/df453168-ac8b-439f-baaa-a999bccd56e2/play_480p.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
            <div className="relative z-10 flex justify-center gap-4 p-4 md:p-6">
              {reels.map((reel, idx) => (
                <div
                  key={idx}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl neon-border-blue glass flex items-center justify-center text-4xl md:text-6xl transition-transform duration-100 ${
                    isSpinning ? 'animate-bounce' : ''
                  }`}
                  style={{
                    transform: !isSpinning ? getMotionTransform(normalizedX, normalizedY, 0.5) : 'none',
                    transitionProperty: isSpinning ? 'none' : 'transform',
                  }}
                >
                  {reel}
                </div>
              ))}
            </div>
          </div>

          {/* Spin Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed hover-lift hover-glow transition-all duration-300"
            >
              {isSpinning ? `⏳ ${t('slots.spinning')}` : `🎯 ${t('slots.freeSpinButton')}`}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-gray-400">
                  {t('slots.or')}
                </span>
              </div>
            </div>

            {/* Points cost selector */}
            <div className="bg-dark-navy rounded-lg p-4 mb-4 hover-lift">
              <p className="text-gray-400 text-sm mb-3">{t('slots.payWithPoints')}</p>
              <div className="flex gap-2">
                {[10, 25, 50].map((cost) => (
                  <button
                    key={cost}
                    onClick={() => setPointsCost(cost)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      pointsCost === cost
                        ? 'bg-neon-pink text-white hover-glow'
                        : 'bg-dark-blue border border-gray-600 text-gray-400 hover:border-neon-pink hover-lift'
                    }`}
                  >
                    {cost} {t('common.pointsAbbr')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSpin(true)}
              disabled={isSpinning || balance < pointsCost}
              className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                balance < pointsCost
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'btn-pink disabled:opacity-50 disabled:cursor-not-allowed hover-lift hover-glow'
              }`}
            >
              {isSpinning ? `⏳ ${t('slots.spinning')}` : `💰 ${t('slots.paidSpinButton', { cost: pointsCost })}`}
            </button>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && result && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`neon-border-${result.success ? 'yellow' : 'pink'} glass-dark rounded-3xl p-12 max-w-md w-full text-center animate-pulse`}>
              {result.success ? (
                <>
                  <div className="text-6xl mb-4">
                    {result.isJackpot ? '🏆' : '✨'}
                  </div>
                  <h2 className={`text-4xl font-black mb-4 ${result.isJackpot ? 'glow-yellow' : 'glow-pink'}`}>
                    {result.result === 0 ? t('slots.lost') : t('slots.won')}
                  </h2>
                  <p className="text-2xl font-black text-neon-yellow mb-6">
                    +{result.result} {t('common.pointsAbbr')}
                  </p>
                  {result.multiplier && result.multiplier > 1 && (
                    <p className="text-lg text-neon-blue mb-4">
                      {t('slots.multiplier')}: {result.multiplier}x
                    </p>
                  )}
                  <p className="text-gray-400 mb-8">
                    {t('slots.newBalance')}: <span className="text-white font-bold">{result.newBalance}</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">❌</div>
                  <h2 className="text-2xl font-black glow-pink mb-4">{t('slots.error')}</h2>
                  <p className="text-gray-400">{result.error}</p>
                </>
              )}

              <button
                onClick={() => setShowResult(false)}
                className="btn-neon w-full mt-8"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="neon-border-blue glass rounded-3xl p-8 hover-lift hover-glow animate-gradient-shift" style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 50%, rgba(255, 255, 0, 0.1) 100%)',
          backgroundSize: '200% 200%',
        }}>
          <h3 className="text-xl font-black text-neon-blue mb-4 animate-twinkle">{t('slots.howItWorks')}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="hover-scale transition-transform duration-300">✅ <span className="text-neon-yellow">{t('slots.rule1')}</span></li>
            <li className="hover-scale transition-transform duration-300">✅ {t('slots.rule2')}</li>
            <li className="hover-scale transition-transform duration-300">✅ {t('slots.rule3')}</li>
            <li className="hover-scale transition-transform duration-300">🏆 {t('slots.rule4')}</li>
          </ul>
        </div>
      </div>

      {/* Stamp Container */}
      <StampContainer stamps={stamps} onRemove={removeStamp} />    </main>
  );
}