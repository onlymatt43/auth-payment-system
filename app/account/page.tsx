'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isNewUiEnabled } from '@/lib/feature-flags';
import { DashboardLayout, SectionHeader } from '@/components/layouts';
import { Alert, Badge, Button, Card, Table } from '@/components/ui';

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
  const { status } = useSession();
  const router = useRouter();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewUi = isNewUiEnabled('payment');

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
      setError(null);
      const res = await fetch('/api/account');
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
      } else {
        throw new Error('Failed to load account data');
      }
    } catch (loadError) {
      console.error('Failed to load account:', loadError);
      setError('Unable to load account data.');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (!accountData) return [];
    return accountData.transactions.map((tx) => [
      tx.type,
      `${tx.amount > 0 ? '+' : ''}${tx.amount} pts`,
      `${tx.balance_after} pts`,
      new Date(tx.created_at).toLocaleString('fr-FR'),
    ]);
  }, [accountData]);

  if (status === 'loading' || loading) {
    return (
      <main className="app-shell profile-velvet-bg min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border-default bg-surface p-10 text-center text-text-secondary">
          Loading account data...
        </div>
      </main>
    );
  }

  if (!accountData) {
    return (
      <main className="app-shell profile-velvet-bg min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-danger/60 bg-danger/10 p-10 text-center text-danger">
          Failed to load account.
        </div>
      </main>
    );
  }

  if (!isNewUi) {
    return (
      <main className="app-shell profile-velvet-bg min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <div className="rounded-3xl border border-border-default bg-surface p-6">
            <h1 className="font-display text-4xl font-black">Account</h1>
            <p className="text-text-secondary">Legacy fallback mode via feature flag.</p>
          </div>
          <Card>
            <p className="text-text-secondary">Balance: {accountData.balance}</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      title="My Account"
      subtitle={accountData.email}
      actions={
        <Button tone="accent" variant="outline" onClick={() => router.push('/shop')}>
          Back to shop
        </Button>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-brand/50 bg-brand/10">
          <Badge tone="brand">Balance</Badge>
          <p className="mt-3 font-display text-4xl font-black text-brand">{accountData.balance}</p>
          <p className="text-sm text-text-muted">Available points</p>
        </Card>
        <Card className="border-accent/50 bg-accent/10">
          <Badge tone="accent">Total earned</Badge>
          <p className="mt-3 font-display text-4xl font-black text-accent">{accountData.total_earned}</p>
          <p className="text-sm text-text-muted">Points</p>
        </Card>
        <Card className="border-danger/50 bg-danger/10">
          <Badge tone="danger">Total spent</Badge>
          <p className="mt-3 font-display text-4xl font-black text-danger">{accountData.total_spent}</p>
          <p className="text-sm text-text-muted">Points</p>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          label="History"
          title="Recent Transactions"
          description="Track purchases, spends and refunds in one place."
        />
        {rows.length ? (
          <Table headers={['Type', 'Amount', 'Balance after', 'Date']} rows={rows} />
        ) : (
          <Card className="text-center text-text-muted">No transaction yet.</Card>
        )}
      </section>

      <Card className="text-sm text-text-secondary">
        Account created: {new Date(accountData.created_at).toLocaleString('fr-FR')}
        <br />
        Last update: {new Date(accountData.updated_at).toLocaleString('fr-FR')}
      </Card>
    </DashboardLayout>
  );
}
