'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CTAButtons } from '@/components/CTAButtons';

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
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent"></div>
            <span className="text-neon-yellow text-2xl">⚡</span>
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent"></div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter">
            <span className="gradient-text">ONLYPOINT$</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Level up • Earn more • Play more
          </p>
        </div>

        {/* Display balance if logged in */}
        {session && balance && (
          <div className="mb-12 text-center">
            <p className="text-sm text-gray-400 mb-2">YOUR BALANCE</p>
            <p className="text-5xl font-black glow-yellow">{balance.balance} PTS</p>
          </div>
        )}

        {/* Main CTA Buttons - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <CTAButtons />
        </div>

        {/* Bottom spacing */}
        <div className="mt-12 md:mt-20"></div>

        {/* Footer decoration */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-yellow"></div>
          <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
          <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
        </div>
      </div>
    </main>
  );
}
