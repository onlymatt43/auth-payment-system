'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { spinSlots } from '@/lib/slots';

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
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🎪', '🎪', '🎪']);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [balance, setBalance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [canPayWithPoints, setCanPayWithPoints] = useState(false);
  const [pointsCost, setPointsCost] = useState(10);

  // Load user balance
  useEffect(() => {
    if (session?.user?.email) {
      fetchBalance();
    }
  }, [session]);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      setBalance(data.points || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
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
      setResult({
        success: false,
        error: `Insufficient points. Need ${pointsCost}, have ${balance}`,
      });
      setShowResult(true);
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

    // Update balance if successful
    if (spinResult.success && spinResult.newBalance !== undefined) {
      setBalance(spinResult.newBalance);
    } else {
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
          <h1 className="text-4xl font-black gradient-text mb-4">SLOTS MACHINE</h1>
          <p className="text-gray-400 mb-8">Connecte-toi pour jouer!</p>
          <button
            onClick={() => router.push('/shop')}
            className="btn-neon"
          >
            ALLER À LA BOUTIQUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            <span className="gradient-text">SLOTS</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">Spin et gagne des points!</p>
          <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
        </div>

        {/* Balance Display */}
        <div className="neon-border-yellow glass-dark rounded-3xl p-8 mb-12">
          <div className="text-center">
            <p className="text-neon-yellow text-xs tracking-widest font-bold mb-2">BALANCE</p>
            <p className="text-5xl font-black glow-yellow">{balance}</p>
            <p className="text-gray-400 text-sm mt-2">OnlySLUT POINTS</p>
          </div>
        </div>

        {/* Slot Machine */}
        <div className="neon-border-pink glass-dark rounded-3xl p-8 mb-12">
          {/* Reels */}
          <div className="flex justify-center gap-4 mb-8">
            {reels.map((reel, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl neon-border-blue glass flex items-center justify-center text-4xl md:text-6xl ${
                  isSpinning ? 'animate-bounce' : ''
                }`}
              >
                {reel}
              </div>
            ))}
          </div>

          {/* Spin Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpinning ? '⏳ SPINNING...' : '🎯 SPIN GRATUIT (24h)'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-gray-400">
                  OU
                </span>
              </div>
            </div>

            {/* Points cost selector */}
            <div className="bg-dark-navy rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-3">Payer avec des points:</p>
              <div className="flex gap-2">
                {[10, 25, 50].map((cost) => (
                  <button
                    key={cost}
                    onClick={() => setPointsCost(cost)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                      pointsCost === cost
                        ? 'bg-neon-pink text-white'
                        : 'bg-dark-blue border border-gray-600 text-gray-400 hover:border-neon-pip'
                    }`}
                  >
                    {cost} pts
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSpin(true)}
              disabled={isSpinning || balance < pointsCost}
              className={`w-full py-3 rounded-lg font-bold transition ${
                balance < pointsCost
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'btn-pink disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSpinning ? '⏳ SPINNING...' : `💰 SPIN POUR ${pointsCost} PTS`}
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
                    {result.result === 0 ? 'PERDU!' : 'GAGNÉ!'}
                  </h2>
                  <p className="text-2xl font-black text-neon-yellow mb-6">
                    +{result.result} PTS
                  </p>
                  {result.multiplier && result.multiplier > 1 && (
                    <p className="text-lg text-neon-blue mb-4">
                      Multiplicateur: {result.multiplier}x
                    </p>
                  )}
                  <p className="text-gray-400 mb-8">
                    Nouveau solde: <span className="text-white font-bold">{result.newBalance}</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">❌</div>
                  <h2 className="text-2xl font-black glow-pink mb-4">ERREUR</h2>
                  <p className="text-gray-400">{result.error}</p>
                </>
              )}

              <button
                onClick={() => setShowResult(false)}
                className="btn-neon w-full mt-8"
              >
                FERMER
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="neon-border-blue glass rounded-3xl p-8">
          <h3 className="text-xl font-black text-neon-blue mb-4">COMMENT ÇA MARCHE?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✅ <span className="text-neon-yellow">1 spin gratuit par 24h</span></li>
            <li>✅ Utilise tes points pour plus de spins</li>
            <li>✅ Gagne entre 0 et 250 points</li>
            <li>🏆 Déclenche le JACKPOT et gagne BIG!</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
