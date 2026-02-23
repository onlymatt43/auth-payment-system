'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Transaction {
  id: number;
  type: string;
  points: number;
  balance_after: number;
  created_at: string;
  metadata?: any;
}

interface AccountData {
  email: string;
  points: number;
  total_spent: number;
  total_purchased: number;
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Erreur de chargement</div>
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
        label: 'Achat PayPal',
        color: 'text-green-400',
        sign: '+',
      };
    } else if (tx.type === 'spend') {
      const projectName = tx.metadata?.project_slug || 'Projet';
      return {
        label: `Accès ${projectName}`,
        color: 'text-red-400',
        sign: '-',
      };
    } else if (tx.type === 'refund') {
      return {
        label: 'Remboursement',
        color: 'text-blue-400',
        sign: '+',
      };
    } else if (tx.type === 'bonus') {
      return {
        label: 'Bonus',
        color: 'text-yellow-400',
        sign: '+',
      };
    }
    return {
      label: tx.type,
      color: 'text-gray-400',
      sign: '',
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/shop')}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Retour à la boutique
          </button>
          <h1 className="text-4xl font-bold mb-2">Mon Compte</h1>
          <p className="text-gray-400">{accountData.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Solde actuel</div>
            <div className="text-3xl font-bold text-green-400">
              {accountData.points} pts
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total acheté</div>
            <div className="text-3xl font-bold">
              {accountData.total_purchased} pts
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total dépensé</div>
            <div className="text-3xl font-bold">
              {accountData.total_spent} pts
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Historique des transactions</h2>

          {accountData.transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Aucune transaction pour le moment
            </div>
          ) : (
            <div className="space-y-3">
              {accountData.transactions.map((tx) => {
                const txInfo = getTransactionLabel(tx);
                return (
                  <div
                    key={tx.id}
                    className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{txInfo.label}</div>
                        <div className="text-sm text-gray-400">
                          {formatDate(tx.created_at)}
                        </div>
                        {tx.metadata && tx.metadata.project_slug && (
                          <div className="text-xs text-gray-500 mt-1">
                            Durée: {tx.metadata.session_duration_minutes || 'N/A'} minutes
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className={`text-xl font-bold ${txInfo.color}`}>
                          {txInfo.sign}{tx.points} pts
                        </div>
                        <div className="text-sm text-gray-500">
                          Solde: {tx.balance_after} pts
                        </div>
                      </div>
                    </div>

                    {/* Metadata details */}
                    {tx.metadata && (
                      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                        {tx.metadata.paypal_order_id && (
                          <div>PayPal: {tx.metadata.paypal_order_id}</div>
                        )}
                        {tx.metadata.ip_address && (
                          <div>IP: {tx.metadata.ip_address}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Compte créé le {formatDate(accountData.created_at)}</p>
          <p className="mt-1">
            Dernière mise à jour: {formatDate(accountData.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
