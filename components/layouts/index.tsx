'use client';

import { PropsWithChildren, ReactNode } from 'react';
import { Card } from '@/components/ui';

export function AuthLayout({ children, aside }: PropsWithChildren<{ aside?: ReactNode }>) {
  return (
    <main className="app-shell min-h-screen px-6 py-12 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="animate-fade-in-up">{children}</Card>
        {aside ? <Card className="animate-fade-in-up animation-delay-120">{aside}</Card> : null}
      </div>
    </main>
  );
}

export function PaymentLayout({ children }: PropsWithChildren) {
  return (
    <main className="app-shell min-h-screen px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  actions,
}: PropsWithChildren<{ title: string; subtitle?: string; actions?: ReactNode }>) {
  return (
    <main className="app-shell min-h-screen px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-text-primary md:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-text-secondary">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
        {children}
      </div>
    </main>
  );
}

export function SectionHeader({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">{label}</p> : null}
      <h2 className="font-display text-2xl font-bold text-text-primary md:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-text-secondary">{description}</p> : null}
    </div>
  );
}

export function FormSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="space-y-4 rounded-2xl border border-border-default bg-surface-elevated p-5 md:p-6">
      <h3 className="font-display text-xl font-bold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}
