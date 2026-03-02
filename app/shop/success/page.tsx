'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const points = searchParams.get('points');
  const balance = searchParams.get('balance');

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="neon-border-yellow glass-dark rounded-3xl p-12 text-center transform animate-pulse">
          {/* Checkmark Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-neon-yellow opacity-20 animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center text-6xl">✨</div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6">ACHAT RÉUSSI!</h1>
          
          {/* Points received */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm tracking-widest font-bold mb-3">POINTS REÇUS</p>
            <div className="text-6xl md:text-7xl font-black glow-yellow">+{points}</div>
            <p className="text-neon-yellow font-bold text-lg mt-2">POINTS DÉBLOQUÉS</p>
          </div>

          {/* Balance display */}
          <div className="neon-border-pink rounded-2xl p-8 mb-8 bg-dark-navy/50">
            <p className="text-neon-pink text-xs tracking-widest font-bold mb-3">NOUVEAU SOLDE</p>
            <div className="text-5xl font-black glow-pink">{balance}</div>
            <p className="text-gray-400 text-sm mt-2">points disponibles</p>
          </div>

          {/* Decorative line */}
          <div className="h-1 w-32 mx-auto mb-8 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Link
              href="/shop"
              className="btn-neon w-full block text-center"
            >
              🛍️ RETOUR À LA BOUTIQUE
            </Link>
            <Link
              href="/account"
              className="btn-blue w-full block text-center"
            >
              👤 VOIR MON COMPTE
            </Link>
          </div>
        </div>

        {/* Footer message */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Vos points sont <span className="text-neon-yellow font-bold">disponibles immédiatement</span>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse glow-blue">⚡</div>
          <p className="text-white text-lg glow-blue">Vérification en cours...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
