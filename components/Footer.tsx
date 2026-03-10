'use client';

import Link from 'next/link';

const touchLink = 'inline-flex min-h-[44px] items-center rounded-md px-2 hover:text-brand';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-surface/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <section className="text-center">
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm text-text-secondary">
            <li><Link href="/shop" className={touchLink}>Shop</Link></li>
            <li><Link href="/slots" className={touchLink}>Slots</Link></li>
            <li><Link href="/account" className={touchLink}>Account</Link></li>
            <li><Link href="/login" className={touchLink}>Login/Out</Link></li>
          </ul>
        </section>

        <section className="mt-5 text-center">
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm text-text-secondary">
            <li><Link href="/terms" className={touchLink}>Terms</Link></li>
            <li><Link href="/privacy" className={touchLink}>Privacy</Link></li>
            <li><a href="mailto:support@onlymatt.ca" className={touchLink}>Support</a></li>
          </ul>
        </section>
        <div className="mt-6 border-t border-border-default/70 pt-4 text-center text-xs text-text-muted">
          © {currentYear} THEOM43.TEAM by ONLYMATT.CA
        </div>
      </div>
    </footer>
  );
}
