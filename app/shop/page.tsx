'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse glow-blue">⚡</div>
          <p className="text-white text-lg glow-blue">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header avec Hero */}
        <div className="mb-16 relative overflow-hidden rounded-3xl">
          <div className="relative z-10 py-12 px-8 md:px-16 text-center">
            {/* Ligne décorative supérieure */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent"></div>
              <span className="text-neon-yellow text-2xl">⚡</span>
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent"></div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
              <span className="gradient-text">POINT$</span>
            </h1>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              <span className="text-neon-pink">UNLOCK</span> premium access • <span className="text-neon-blue">UNLIMITED</span> possibilities
            </p>

            {/* Ligne décorative inférieure */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent"></div>
              <span className="text-neon-pink">✦</span>
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Solde utilisateur */}
        {session && balance && (
          <div className="mb-12 relative group">
            <div className="neon-border-yellow glass rounded-3xl p-8 md:p-12 transform hover:scale-105 transition duration-300">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-neon-yellow text-xs tracking-widest font-bold mb-2">VOTRE SOLDE</p>
                  <p className="text-4xl md:text-5xl font-black glow-yellow">{balance.points}</p>
                  <p className="text-gray-400 text-sm mt-2">POINTS DISPONIBLES</p>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-1 h-20 bg-gradient-to-b from-neon-yellow via-neon-pink to-neon-blue"></div>
                </div>
                <div className="text-right">
                  <p className="text-neon-pink text-xs tracking-widest font-bold mb-2">TOTAL ACHETÉ</p>
                  <p className="text-4xl md:text-5xl font-black glow-pink">{balance.total_purchased}</p>
                  <p className="text-gray-400 text-sm mt-2">POINTS PTS</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/account')}
                className="btn-neon w-full mt-8"
              >
                ⚡ MON COMPTE & HISTORIQUE
              </button>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-black gradient-text">PACKAGES</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.filter(pkg => pkg.active).map((pkg, index) => {
              const valuePerPoint = (pkg.price_usd / pkg.points).toFixed(3);
              const colors = [
                { border: 'neon-border-yellow', glow: 'glow-yellow', btn: 'btn-neon', accent: 'text-neon-yellow' },
                { border: 'neon-border-pink', glow: 'glow-pink', btn: 'btn-pink', accent: 'text-neon-pink' },
                { border: 'neon-border-blue', glow: 'glow-blue', btn: 'btn-blue', accent: 'text-neon-blue' },
              ];
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={pkg.id}
                  className={`${color.border} glass-dark rounded-3xl p-8 transform hover:scale-105 transition duration-300 relative overflow-hidden group`}
                >
                  {/* Background animate */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  
                  <div className={`text-xs tracking-widest font-bold mb-4 ${color.accent}`}>
                    {index === 0 ? '⭐ STARTER' : index === 1 ? '💎 PRO' : '👑 PREMIUM'}
                  </div>
                  
                  <h3 className={`text-2xl font-black mb-6 ${color.glow}`}>{pkg.name}</h3>
                  
                  <div className="mb-6 py-6 border-t border-b border-gray-700">
                    <p className={`text-5xl font-black ${color.accent} mb-2`}>{pkg.points}</p>
                    <p className="text-gray-400 text-sm">POINTS</p>
                  </div>
                  
                  <div className="mb-8 space-y-2">
                    <p className="text-3xl font-black">${pkg.price_usd.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">
                      <span className={color.accent}>${valuePerPoint}</span> par point
                    </p>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    className={`${color.btn} w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition duration-300`}
                  >
                    {purchasing === pkg.id ? '⏳ PROCESSING...' : '🚀 ACHETER MAINTENANT'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-black">COMMENT ÇA MARCHE?</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-blue to-transparent"></div>
          </div>
          
          <div className="neon-border-blue glass rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="text-3xl glow-blue">1️⃣</div>
                <h3 className="font-black text-neon-blue">CONNECTEZ-VOUS</h3>
                <p className="text-sm text-gray-400">Avec votre compte Google</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl glow-pink">2️⃣</div>
                <h3 className="font-black text-neon-pink">SÉLECTIONNEZ</h3>
                <p className="text-sm text-gray-400">Un package de points</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl glow-yellow">3️⃣</div>
                <h3 className="font-black text-neon-yellow">PAYEZ</h3>
                <p className="text-sm text-gray-400">Sécurisé via PayPal</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">🔓</div>
                <h3 className="font-black">DÉBLOQUEZ</h3>
                <p className="text-sm text-gray-400">Accès illimité immédiat</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!session && (
          <div className="relative overflow-hidden rounded-3xl">
            <div className="neon-border-pink glass py-12 px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-6 gradient-text">PRÊT À COMMENCER?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Connectez-vous avec Google pour accéder à tous les packages et débloquer vos projets favoris
              </p>
              <button
                onClick={() => signIn('google')}
                className="btn-pink"
              >
                🔐 SE CONNECTER AVEC GOOGLE
              </button>
            </div>
          </div>
        )}

        {/* Footer decoration */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-yellow"></div>
          <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
          <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
        </div>
      </div>
    </main>
  );
}
