'use client';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            <span className="gradient-text">POLITIQUE DE CONFIDENTIALITÉ</span>
          </h1>
          <p className="text-gray-400 text-lg">Dernière mise à jour: Mars 2026</p>
          <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue mt-6 mb-12"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">1. Introduction</h2>
            <p className="text-gray-300 mb-4">
              OnlySLUT respecte votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données.
            </p>
            <p className="text-gray-300">
              En utilisant notre plateforme, vous consentez à la collecte et à l'utilisation de vos informations selon cette politique.
            </p>
          </section>

          {/* Section 2 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">2. Données Collectées</h2>
            <div className="space-y-4 text-gray-300">
              <div className="bg-dark-navy rounded-lg p-4 border border-neon-pink/30">
                <h3 className="font-bold mb-2">Données de Compte</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Nom (de Google)</li>
                  <li>• Adresse email</li>
                  <li>• Photo de profil (optionnel)</li>
                  <li>• ID Google OAuth</li>
                </ul>
              </div>

              <div className="bg-dark-navy rounded-lg p-4 border border-neon-pink/30">
                <h3 className="font-bold mb-2">Données de Jeu</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Historique des spins</li>
                  <li>• Points gagnés/dépensés</li>
                  <li>• Résultats des machines à sous</li>
                  <li>• Statistiques de jeu</li>
                </ul>
              </div>

              <div className="bg-dark-navy rounded-lg p-4 border border-neon-pink/30">
                <h3 className="font-bold mb-2">Données de Paiement</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Historique des achats de points</li>
                  <li>• Montants payés (USD)</li>
                  <li>• ID de transaction PayPal</li>
                  <li>• Dates et heures</li>
                </ul>
              </div>

              <div className="bg-dark-navy rounded-lg p-4 border border-neon-pink/30">
                <h3 className="font-bold mb-2">Données Techniques</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Adresse IP</li>
                  <li>• Type de navigateur</li>
                  <li>• Système d'exploitation</li>
                  <li>• Temps de visite</li>
                  <li>• Pages visitées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">3. Utilisation des Données</h2>
            <p className="text-gray-300 mb-4">
              Nous utilisons vos données pour:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Fournir les services de jeu (spins, points, abonnement)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Traiter les paiements via PayPal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Prévenir la fraude et l'abuse du système</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Améliorer l'expérience utilisateur</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Respecter les obligations légales</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✓</span>
                <span>Analyser les tendances de jeu (données anonymisées)</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">4. Protection des Données</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Vos données sont protégées par:
              </p>
              <div className="bg-dark-navy rounded-lg p-4 border border-neon-yellow/30 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-neon-yellow font-bold">🔒</span>
                  <span><strong>Chiffrement HTTPS:</strong> Toutes les communications sont chiffrées (TLS 1.2+)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neon-yellow font-bold">🔒</span>
                  <span><strong>Hashs Sécurisés:</strong> Les mots de passe (le cas échéant) sont hashés avec bcrypt</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neon-yellow font-bold">🔒</span>
                  <span><strong>Redaction des Logs:</strong> Les données sensibles sont automatiquement redactées</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neon-yellow font-bold">🔒</span>
                  <span><strong>Accès Limité:</strong> Seul le personnel autorisé peut accéder aux données</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neon-yellow font-bold">🔒</span>
                  <span><strong>Sauvegarde:</strong> Les données sont sauvegardées sur des serveurs sécurisés</span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">5. Partage des Données</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Nous ne vendons <strong>jamais</strong> vos données. Nous les partageons uniquement avec:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-neon-pink font-bold">→</span>
                  <div>
                    <strong>PayPal:</strong><br/>
                    <span className="text-sm text-gray-400">Pour traiter les transactions. Voir la politique de PayPal.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-pink font-bold">→</span>
                  <div>
                    <strong>Google OAuth:</strong><br/>
                    <span className="text-sm text-gray-400">Pour l'authentification. Voir la politique de Google.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-pink font-bold">→</span>
                  <div>
                    <strong>Turso (Hébergement):</strong><br/>
                    <span className="text-sm text-gray-400">Pour le stockage sécurisé des données. Voir la politique de Turso.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-pink font-bold">→</span>
                  <div>
                    <strong>Autorités Légales:</strong><br/>
                    <span className="text-sm text-gray-400">Si requis par la loi (mandat, subpoena, etc.)</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">6. Cookies et Stockage Local</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                OnlySLUT utilise le localStorage pour:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Stocker votre préférence de langue (EN/FR)</li>
                <li>• Maintenir votre session utilisateur</li>
                <li>• Sauvegarder vos préférences de jeu</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                Ces données sont stockées localement dans votre navigateur et ne sont pas envoyées à nos serveurs 
                sans consentement explicite.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">7. Vos Droits</h2>
            <p className="text-gray-300 mb-4">
              Vous avez le droit de:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-yellow font-bold">→</span>
                <span><strong>Accès:</strong> Demander une copie de vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-yellow font-bold">→</span>
                <span><strong>Rectification:</strong> Mettre à jour ou corriger vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-yellow font-bold">→</span>
                <span><strong>Suppression:</strong> Demander la suppression de votre compte et vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-yellow font-bold">→</span>
                <span><strong>Portabilité:</strong> Obtenir une copie portable de vos données</span>
              </li>
            </ul>
            <p className="text-sm text-gray-400 mt-4">
              Pour exercer ces droits, contactez support@onlyslut.com avec votre email de compte.
            </p>
          </section>

          {/* Section 8 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">8. Conservator des Données</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Nous conservons vos données:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Compte Actif:</strong> Pendant que vous utilises la plateforme</li>
                <li>• <strong>Transactions:</strong> 7 ans (obligations légales)</li>
                <li>• <strong>Logs:</strong> 90 jours (sécurité)</li>
                <li>• <strong>Données Personnelles:</strong> Jusqu'à la suppression du compte</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                Après la suppression du compte, les données personnelles sont anonymisées mais l'historique de transaction 
                peut être conservé pour les obligations légales.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">9. Modifications de la Politique</h2>
            <p className="text-gray-300">
              Nous pouvons modifier cette politique à tout moment. Les modifications entreront en vigueur dès la publication. 
              Nous notifierons les utilisateurs des changements majeurs par email.
            </p>
          </section>

          {/* Section 10 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">10. Contact</h2>
            <p className="text-gray-300 mb-4">
              Si vous avez des questions sur cette politique:
            </p>
            <div className="bg-dark-navy rounded-lg p-4 border border-neon-yellow/30">
              <p><strong>Email:</strong> privacy@onlyslut.com</p>
              <p className="text-sm text-gray-400 mt-2">Réponse en 24-48 heures</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
