import type { Metadata } from 'next';
import { Space_Grotesk, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Footer } from '@/components/Footer';

const displayFont = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const bodyFont = Sora({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const monoFont = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'OnlyMatt - Auth & Payments',
  description: 'Secure auth and payment experience for OnlyMatt.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased flex min-h-screen flex-col`}>
        <div className="flex-1">
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
