'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-dark-darker to-dark-navy border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-black text-neon-yellow mb-4">OnlySLUT</h3>
            <p className="text-sm text-gray-400">
              Plateforme de jeu transparente avec machines à sous équitables et un système de points clair.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black text-neon-pink mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-neon-yellow transition">
                  → Boutique
                </Link>
              </li>
              <li>
                <Link href="/slots" className="text-gray-400 hover:text-neon-yellow transition">
                  → Machines à Sous
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-neon-yellow transition">
                  → Comment ça marche?
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-400 hover:text-neon-yellow transition">
                  → Mon Compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-black text-neon-blue mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-neon-yellow transition">
                  → Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-neon-yellow transition">
                  → Politique de Confidentialité
                </Link>
              </li>
              <li>
                <a href="mailto:support@onlyslut.com" className="text-gray-400 hover:text-neon-yellow transition">
                  → Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 OnlySLUT. Tous droits réservés.</p>
          <p>Plateforme de jeu responsable • Transparent • Sécurisé</p>
        </div>
      </div>
    </footer>
  );
}
