'use client';

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            <span className="gradient-text">COMMENT ÇA MARCHE?</span>
          </h1>
          <p className="text-gray-400 text-lg">Comprendre le système de points OnlySLUT</p>
          <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue mt-6 mb-12"></div>
        </div>

        {/* Points System Explanation */}
        <section className="neon-border-yellow glass-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-black text-neon-yellow mb-6">🎯 Le Système de Points</h2>
          
          <div className="space-y-6 text-gray-300">
            <p>
              OnlySLUT utilise un système de points transparent et équitable. Les points représentent une valeur virtuelle 
              que vous pouvez obtenir en jouant aux machines à sous et utiliser pour accéder à du contenu premium.
            </p>

            <div className="bg-dark-navy rounded-lg p-6 border border-neon-yellow/30">
              <h3 className="text-xl font-bold text-neon-yellow mb-3">Comment obtenir des points?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-neon-yellow font-bold mt-1">→</span>
                  <div>
                    <strong>Free Spin Quotidien</strong><br/>
                    <span className="text-sm text-gray-400">Un spin gratuit par jour (24 heures). Vous avez 1/40 de chance de ne rien gagner, mais jusqu'à 250 points si vous déclenchez le JACKPOT.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-yellow font-bold mt-1">→</span>
                  <div>
                    <strong>Spins Payants</strong><br/>
                    <span className="text-sm text-gray-400">Utilisez vos points existants pour faire plus de spins. Coûts: 10, 25 ou 50 points par spin. Maximum 5 spins par heure.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-yellow font-bold mt-1">→</span>
                  <div>
                    <strong>Acheter des Points</strong><br/>
                    <span className="text-sm text-gray-400">Packages disponibles pour ceux qui veulent plus de chances. USD vers Points à un taux fixe et transparent.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slot Machine Odds */}
        <section className="neon-border-pink glass-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-black text-neon-pink mb-6">🎰 Les Probabilités de Gain</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300">
              Chaque spin utilise un générateur de nombres aléatoires certifié. Voici les probabilités réelles:
            </p>

            <div className="bg-dark-navy rounded-lg p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 text-neon-yellow">Résultat</th>
                    <th className="text-center py-3 text-neon-yellow">Symboles</th>
                    <th className="text-right py-3 text-neon-yellow">Points</th>
                    <th className="text-right py-3 text-neon-yellow">Probabilité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Rien</td>
                    <td className="text-center">🎯 💎 🎪</td>
                    <td className="text-right">0</td>
                    <td className="text-right text-red-400">40%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Petit Gain</td>
                    <td className="text-center">🍒 🍒 🎪</td>
                    <td className="text-right">5</td>
                    <td className="text-right text-gray-400">25%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Gain Moyen</td>
                    <td className="text-center">🍒 🍒 🍒</td>
                    <td className="text-right">10</td>
                    <td className="text-right text-yellow-400">15%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Bon Gain</td>
                    <td className="text-center">💎 💎 🎪</td>
                    <td className="text-right">25</td>
                    <td className="text-right text-yellow-400">10%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Très Bon Gain</td>
                    <td className="text-center">💎 💎 💎</td>
                    <td className="text-right">50</td>
                    <td className="text-right text-neon-blue">6%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Gros Gain</td>
                    <td className="text-center">👑 👑 🎪</td>
                    <td className="text-right">100</td>
                    <td className="text-right text-neon-blue">3%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-neon-yellow">🏆 JACKPOT 🏆</td>
                    <td className="text-center font-bold">👑 👑 👑</td>
                    <td className="text-right font-bold">250</td>
                    <td className="text-right text-neon-yellow">1%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-dark-blue rounded-lg p-4 border border-neon-pink/30">
              <p className="text-sm text-gray-400">
                <strong>RTP (Return to Player):</strong> En moyenne, 50% des points misés sont redistribués aux joueurs. 
                Cela signifie que sur 100 points dépensés, vous récupérez environ 50 points en gains.
              </p>
            </div>
          </div>
        </section>

        {/* Limits & Safety */}
        <section className="neon-border-blue glass-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-black text-neon-blue mb-6">🛡️ Limites & Sécurité</h2>
          
          <div className="space-y-6 text-gray-300">
            <div className="bg-dark-navy rounded-lg p-6">
              <h3 className="text-lg font-bold text-neon-blue mb-3">Rate Limiting</h3>
              <p className="mb-3">
                Pour empêcher l'abuse de la plateforme et les spins automatisés, il existe une limite de <strong>5 spins payants par heure</strong>.
              </p>
              <ul className="text-sm space-y-2 text-gray-400">
                <li>✓ Free spin quotidien: illimité (1 par 24h)</li>
                <li>✓ Spins payants: 5 par heure maximum</li>
                <li>✓ Erreur clear si vous dépassez</li>
              </ul>
            </div>

            <div className="bg-dark-navy rounded-lg p-6">
              <h3 className="text-lg font-bold text-neon-blue mb-3">Vérification des Transactions</h3>
              <p className="text-sm">
                Chaque transaction PayPal est vérifiée avec un checksum cryptographique. Impossible de falsifier les paiements ou les montants.
              </p>
            </div>

            <div className="bg-dark-navy rounded-lg p-6">
              <h3 className="text-lg font-bold text-neon-blue mb-3">Logs Sécurisés</h3>
              <p className="text-sm">
                Toutes les données sensibles (emails, tokens, montants) sont automatiquement redactées dans les logs pour votre protection.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="neon-border-yellow glass-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-black text-neon-yellow mb-6">❓ Questions Fréquentes</h2>
          
          <div className="space-y-4">
            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Est-ce que le RNG est vraiment aléatoire?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Oui. Notre générateur de nombres aléatoires utilise la méthode cryptographique standards de Node.js. 
                Chaque spin est complètement indépendant des précédents.
              </p>
            </details>

            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Peux-je perdre mes points?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Les points gratuits (du free spin) ne disparaissent jamais. Seuls les points que vous dépensez en spins payants 
                sont utilisés. Les gains restent vôtres.
              </p>
            </details>

            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Comment sont stockés mes points?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Vos points sont stockés dans une base de données Turso (LibSQL) hébergée sur AWS. Chaque transaction est enregistrée 
                et vérifiée. Vous pouvez voir votre historique dans votre compte.
              </p>
            </details>

            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Y a-t-il des frais cachés?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Non. Les prix affichés sont exactement ce que vous payez. Les frais de transaction PayPal sont pris en charge 
                par OnlySLUT, pas par vous.
              </p>
            </details>

            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Que se passe-t-il si je demande un remboursement?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Les points gratuits ne peuvent pas être remboursés. Les points achetés peuvent être remboursés selon les conditions 
                PayPal (30 jours). Pour les points dépensés, nous ne pouvons pas les reverser.
              </p>
            </details>

            <details className="group border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-neon-yellow/50 transition">
              <summary className="font-bold text-neon-yellow">Comment puis-je convertir les points en argent?</summary>
              <p className="text-gray-300 mt-3 text-sm">
                Les points ne peuvent pas être reconvertis en argent. Ils sont destinés à être dépensés pour accéder au contenu 
                premium. C'est une monnaie interne à la plateforme.
              </p>
            </details>
          </div>
        </section>

        {/* Transparency */}
        <section className="neon-border-pink glass-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-black text-neon-pink mb-6">📊 Notre Engagement</h2>
          
          <div className="space-y-4 text-gray-300">
            <p>
              Nous croyons en la transparence totale. Voici comment nous opérons:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">✓</span>
                <div>
                  <strong>Probabilités Affichées</strong><br/>
                  <span className="text-sm text-gray-400">Tous les odds sont publics et vérifiables.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">✓</span>
                <div>
                  <strong>Aucune Manipulation</strong><br/>
                  <span className="text-sm text-gray-400">Le code du RNG est auditable et utilise des standards industrie.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">✓</span>
                <div>
                  <strong>Historique Traçable</strong><br/>
                  <span className="text-sm text-gray-400">Chaque spin, achat et transaction est enregistré et vérifiable.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">✓</span>
                <div>
                  <strong>Paiements Vérifiés</strong><br/>
                  <span className="text-sm text-gray-400">PayPal et checksums pour garantir l'authenticité des transactions.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="neon-border-blue glass-dark rounded-3xl p-12">
            <h2 className="text-2xl font-black text-neon-blue mb-4">Prêt à Jouer?</h2>
            <p className="text-gray-300 mb-6">
              Comprendre les règles est le premier pas. Maintenant, essayez votre chance!
            </p>
            <a
              href="/slots"
              className="btn-neon inline-block"
            >
              Aller aux Slots →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
