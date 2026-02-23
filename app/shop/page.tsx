'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PointPackage {
  id: number;
  name: string;
  points: number;
  price_usd: number;
  active: boolean;
}

interface UserBalance {
  email: string;
  points: number;
  total_spent: number;
  total_purchased: number;
  recent_transactions: Array<{
    type: string;
    points: number;
    balance_after: number;
    created_at: string;
  }>;
}

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [session]);

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Boutique de Points</h1>
          <p className="text-zinc-400">Achetez des points pour accéder à vos projets favoris</p>
        </div>

        {/* Solde */}
        {session && balance && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400">Votre solde</p>
                <p className="text-3xl font-bold">{balance.points} points</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">Total acheté</p>
                <p className="text-xl">{balance.total_purchased} pts</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/account')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              📊 Voir mon compte et historique
            </button>
          </div>
        )}

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.filter(pkg => pkg.active).map((pkg) => {
            const valuePerPoint = (pkg.price_usd / pkg.points).toFixed(3);
            
            return (
              <div
                key={pkg.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition"
              >
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <p className="text-4xl font-bold">{pkg.points}</p>
                  <p className="text-sm text-zinc-400">points</p>
                </div>
                <div className="mb-6">
                  <p className="text-2xl">${pkg.price_usd.toFixed(2)} USD</p>
                  <p className="text-xs text-zinc-500">${valuePerPoint} par point</p>
                </div>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  {purchasing === pkg.id ? 'Redirection...' : 'Acheter'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="font-bold mb-4">Comment ça marche?</h3>
          <ol className="space-y-2 text-sm text-zinc-300">
            <li>1. Connectez-vous avec votre compte Google</li>
            <li>2. Achetez un package de points via PayPal</li>
            <li>3. Utilisez vos points pour accéder aux projets</li>
            <li>4. Chaque point = 6 minutes d'accès (ajustable selon promotions)</li>
          </ol>
        </div>

        {/* Auth */}
        {!session && (
          <div className="mt-8 text-center">
            <button
              onClick={() => signIn('google')}
              className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition"
            >
              Se connecter avec Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
