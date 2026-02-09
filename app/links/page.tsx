import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'ONLYMATT | Connect',
  description: 'Projets, services et recommandations.',
  openGraph: {
    title: 'ONLYMATT',
    description: 'EDITORIAL CREATOR',
    // C'est cette image qui apparaîtra quand tu colleras le lien en DM
    images: [{ url: 'https://onlymatt-media.b-cdn.net/Untitled-7.png' }],
  },
};

const links = [
  { title: '🌐 SITE OFFICIEL', url: 'https://onlymatt.ca', color: 'border-zinc-700' },
  { title: '🛒 PROFIL AMAZON', url: 'https://www.amazon.ca/gp/profile/amzn1.account.AGKXJLNXARH2FYTIX4ZHRC6B2K3Q', color: 'border-zinc-800' },
  { title: '💬 WHATSAPP', url: 'https://wa.me/15147120578', color: 'border-zinc-800' },
  { title: '💳 PAYPAL', url: 'https://paypal.me/onlymatt43', color: 'border-zinc-800' },
  { title: '💸 WISE', url: 'https://wise.com/pay/me/mathieuc571', color: 'border-zinc-800' },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-16">
      {/* Header avec ton image Bunny.net */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border border-zinc-800 mb-6 shadow-2xl shadow-zinc-900/50 relative">
          <Image 
            src="https://onlymatt-media.b-cdn.net/Untitled-7.png" 
            alt="Mathieu Courchesne" 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
          />
        </div>
        <h1 className="text-xl font-light tracking-[0.3em] uppercase">Mathieu Courchesne</h1>
        <div className="h-[1px] w-12 bg-zinc-700 my-4"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">TES • Creative</p>
      </div>

      {/* Liste des boutons - Style Minimaliste Edgy */}
      <div className="w-full max-w-sm space-y-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full py-4 px-6 text-center border border-zinc-800 bg-zinc-950 hover:border-zinc-500 transition-all duration-300 rounded-sm text-[11px] font-bold tracking-[0.15em] uppercase"
          >
            <span className="relative z-10">{link.title}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          </a>
        ))}
      </div>

      {/* Footer simple */}
      <footer className="mt-auto pt-16 text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-light">
        OM43 DIGITAL © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
