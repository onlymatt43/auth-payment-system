'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

interface AccountData {
  email: string;
  balance: number;
  total_spent: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/shop');
      return;
    }

    if (status === 'authenticated') {
      loadAccountData();
    }
  }, [status, router]);

  const loadAccountData = async () => {
    try {
      const res = await fetch('/api/account');
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
      } else {
        throw new Error('Failed to load account data');
      }
    } catch (error) {
      console.error('Failed to load account:', error);
      alert('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse glow-blue">⚡</div>
          <p className="text-white text-lg glow-blue">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-3xl glow-pink">❌ Erreur de chargement</div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionLabel = (tx: Transaction) => {
    if (tx.type === 'purchase') {
      return {
        label: '💳 Achat PayPal',
        color: 'text-neon-yellow',
        sign: '+',
        icon: '📈',
      };
    } else if (tx.type === 'spend') {
      return {
        label: '🔓 Accès Projet',
        color: 'text-neon-pink',
        sign: '-',
        icon: '⚙️',
      };
    } else if (tx.type === 'refund') {
      return {
        label: '💰 Remboursement',
        color: 'text-neon-blue',
        sign: '+',
        icon: '↩️',
      };
    } else if (tx.type === 'bonus') {
      return {
        label: '🎁 Bonus',
        color: 'text-neon-yellow',
        sign: '+',
        icon: '⭐',
      };
    }
    return {
      label: tx.type,
      color: 'text-gray-400',
      sign: '',
      icon: '•',
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 text-neon-blue hover:text-neon-yellow transition duration-300 mb-6 text-sm tracking-widest font-bold"
          >
            ← RETOUR À LA BOUTIQUE
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black gradient-text mb-2">MON COMPTE</h1>
              <p className="text-gray-400 font-mono text-sm">{accountData.email}</p>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Current Balance */}
          <div className="neon-border-yellow glass-dark rounded-3xl p-8 transform hover:scale-105 transition duration-300">
            <div className="text-neon-yellow text-xs tracking-widest font-bold mb-4">💰 SOLDE ACTUEL</div>
            <div className="text-5xl font-black glow-yellow mb-4">{accountData.balance}</div>
            <div className="text-gray-400 text-sm">points disponibles</div>
          </div>

          {/* Total Earned */}
          <div className="neon-border-pink glass-dark rounded-3xl p-8 transform hover:scale-105 transition duration-300">
            <div className="text-neon-pink text-xs tracking-widest font-bold mb-4">📊 TOTAL GAGNÉ</div>
            <div className="text-5xl font-black glow-pink mb-4">{accountData.total_earned}</div>
            <div className="text-gray-400 text-sm">points PTS</div>
          </div>

          {/* Total Spent */}
          <div className="neon-border-blue glass-dark rounded-3xl p-8 transform hover:scale-105 transition duration-300">
            <div className="text-neon-blue text-xs tracking-widest font-bold mb-4">🚀 TOTAL DÉPENSÉ</div>
            <div className="text-5xl font-black glow-blue mb-4">{accountData.total_spent}</div>
            <div className="text-gray-400 text-sm">points PTS</div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-black">HISTORIQUE</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-blue to-transparent"></div>
          </div>

          <div className="neon-border-blue glass rounded-3xl p-8">
            {accountData.transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">Aucune transaction pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accountData.transactions.map((tx, index) => {
                  const txInfo = getTransactionLabel(tx);
                  return (
                    <div key={tx.id} className="group">
                      <div className="glass-dark rounded-2xl p-6 border border-gray-700 hover:border-neon-blue transition duration-300 transform hover:scale-102">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className={`text-lg font-black ${txInfo.color} mb-2`}>
                              {txInfo.icon} {txInfo.label}
                            </div>
                            <div className="text-gray-400 text-xs tracking-widest mb-2">
                              {formatDate(tx.created_at)}
                            </div>
                          </div>

                          <div className="text-right border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6">
                            <div className={`text-3xl font-black ${txInfo.color} mb-2`}>
                              {txInfo.sign}{tx.amount} pts
                            </div>
                            <div className="text-gray-400 text-sm">
                              Solde: <span className="text-white font-bold">{tx.balance_after} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Account Info Footer */}
        <div className="glass rounded-3xl p-8 text-center">
          <div className="space-y-2 text-sm text-gray-400">
            <p>Compte créé le <span className="text-neon-blue font-mono">{formatDate(accountData.created_at)}</span></p>
            <p>Dernière mise à jour: <span className="text-neon-pink font-mono">{formatDate(accountData.updated_at)}</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}
