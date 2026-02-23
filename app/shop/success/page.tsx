'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const points = searchParams.get('points');
  const balance = searchParams.get('balance');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Achat réussi!</h1>
        
        <div className="mb-6">
          <p className="text-zinc-400 mb-2">Vous avez reçu</p>
          <p className="text-5xl font-bold text-green-500">+{points} points</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-400">Votre nouveau solde</p>
          <p className="text-2xl font-bold">{balance} points</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Retour à la boutique
          </Link>
          <Link
            href="/account"
            className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Voir mon compte
          </Link>
        </div>
      </div>
    </div>
  );
}
