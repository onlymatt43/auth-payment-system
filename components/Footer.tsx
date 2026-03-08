'use client';

import Link from 'next/link';

const touchLink = 'inline-flex min-h-[44px] items-center rounded-md px-2 hover:text-brand';

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface/80 backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-3 md:px-10">
        <section>
          <h3 className="font-display text-xl font-black uppercase text-brand">OnlyMatt</h3>
          <p className="mt-3 text-sm text-text-muted">
            Secure access and payment platform with transparent point purchases.
          </p>
        </section>

        <section>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Navigation</h4>
          <ul className="mt-2 text-sm text-text-secondary">
            <li><Link href="/shop" className={touchLink}>Shop</Link></li>
            <li><Link href="/slots" className={touchLink}>Slots</Link></li>
            <li><Link href="/account" className={touchLink}>Account</Link></li>
          </ul>
        </section>

        <section>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Legal</h4>
          <ul className="mt-2 text-sm text-text-secondary">
            <li><Link href="/terms" className={touchLink}>Terms</Link></li>
            <li><Link href="/privacy" className={touchLink}>Privacy</Link></li>
            <li><a href="mailto:support@onlymatt.ca" className={touchLink}>Support</a></li>
          </ul>
        </section>
      </div>
      <div className="border-t border-border-default px-6 py-4 text-center text-xs text-text-muted md:px-10">
        © 2026 OnlyMatt. Built for modern desktop and mobile browsers.
      </div>
    </footer>
  );
}
