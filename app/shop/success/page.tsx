'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isNewUiEnabled } from '@/lib/feature-flags';
import { PaymentLayout } from '@/components/layouts';
import { Badge, Card } from '@/components/ui';

function SuccessContent() {
  const searchParams = useSearchParams();
  const points = Number(searchParams.get('points') || 0);
  const balance = Number(searchParams.get('balance') || 0);
  const isNewUi = isNewUiEnabled('payment');

  if (!isNewUi) {
    return (
      <main className="app-shell min-h-screen px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border-default bg-surface p-8 text-center">
          <h1 className="font-display text-4xl font-black text-text-primary">Payment Success</h1>
          <p className="mt-3 text-text-secondary">+{points} points added.</p>
          <p className="text-text-secondary">Current balance: {balance}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link href="/shop" className="inline-flex items-center justify-center rounded-2xl border border-brand bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-strong">Back to shop</Link>
            <Link href="/account" className="inline-flex items-center justify-center rounded-2xl border border-accent bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-strong">Open account</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PaymentLayout>
      <div className="mx-auto max-w-3xl animate-fade-in-up">
        <Card className="border-success/60 text-center">
          <Badge tone="accent">Transaction complete</Badge>
          <h1 className="mt-4 font-display text-5xl font-black uppercase tracking-tight text-text-primary">Points Activated</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Your purchase is confirmed and points are immediately available in your account.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-brand/50 bg-brand/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Received</p>
              <p className="mt-2 font-display text-5xl font-black text-brand">+{points}</p>
            </div>
            <div className="rounded-2xl border border-accent/50 bg-accent/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">New Balance</p>
              <p className="mt-2 font-display text-5xl font-black text-accent">{balance}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <Link href="/shop" className="inline-flex items-center justify-center rounded-2xl border border-brand bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-strong">Back to Shop</Link>
            <Link href="/account" className="inline-flex items-center justify-center rounded-2xl border border-accent bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-strong">View Account</Link>
          </div>
        </Card>
      </div>
    </PaymentLayout>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell min-h-screen px-6 py-10 md:px-10">
          <div className="mx-auto flex max-w-3xl items-center justify-center rounded-3xl border border-border-default bg-surface p-12">
            <p className="text-text-secondary">Processing confirmation...</p>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
