'use client';

import { BrandBanner } from '@/components/BrandBanner';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <BrandBanner compact />
        </div>
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            <span className="gradient-text">CONDITIONS D'UTILISATION</span>
          </h1>
          <p className="text-gray-400 text-lg">Dernière mise à jour: Mars 2026</p>
          <div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue mt-6 mb-12"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">1. Accord Légal</h2>
            <p className="text-gray-300 mb-4">
              En accédant et en utilisant ONLYMATT, vous acceptez de respecter ces conditions d'utilisation.
              Si vous n'êtes pas d'accord, veuillez cesser d'utiliser notre plateforme.
            </p>
            <p className="text-gray-300 mb-4">
              ONLYMATT a créé ce système pour offrir un acces au contenu à moindre coût, en reduisant les gros intermédiaires et en facilitant un accès direct entre les modèles et les utilisateurs.
            </p>
            <p className="text-gray-300">
              ONLYMATT est fourni "tel quel" sans garanties de quelque nature que ce soit, explicites ou implicites.
            </p>
          </section>

          {/* Section 2 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">2. Conditions d'Accès</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">•</span>
                <span>Vous devez avoir au moins 18 ans pour utiliser cette plateforme</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">•</span>
                <span>Un compte valide avec Google OAuth est requis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">•</span>
                <span>Une seule session par adresse email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">•</span>
                <span>Interdiction de créer des comptes de bot ou automatisés</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-pink font-bold">•</span>
                <span>Interdiction d'utiliser des proxies ou VPN pour contourner les limites</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">3. Utilisation des Points</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Points Gratuits:</strong> Les points obtenus via le free spin quotidien ne peuvent pas être convertis 
                en argent. Ils sont destinés uniquement à être utilisés sur la plateforme.
              </p>
              <p>
                <strong>Points Achetés:</strong> Les points achetés avec de l'argent réel correspondent à une valeur numérique 
                sur notre plateforme. Ils ne sont pas remboursables sauf selon les conditions PayPal.
              </p>
              <p>
                <strong>Expiration:</strong> Les points n'expirent pas, mais votre compte peut être suspendu après inactivité 
                d'un an, auquel cas les points seront perdus.
              </p>
              <p>
                <strong>Transfert:</strong> Les points ne peuvent pas être transférés entre comptes. Chaque compte a son solde 
                indépendant.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">4. Jeu Responsable</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                ONLYMATT n'encourage pas le jeu excessif. Nous avons implémenté des limites de taux pour éviter les abus.
              </p>
              <div className="bg-dark-navy rounded-lg p-4 border border-neon-yellow/30">
                <p className="font-bold mb-2">Limites de Sécurité:</p>
                <ul className="space-y-2 text-sm">
                  <li>• Maximum 5 spins payants par heure</li>
                  <li>• 1 free spin par 24 heures</li>
                  <li>• Taux de retour (RTP) fixé à 50%</li>
                </ul>
              </div>
              <p className="text-sm text-gray-400">
                Si vous sentez que vous développez une dépendance au jeu, veuillez contacter le support ou visiter 
                des ressources d'aide en ligne.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">5. Paiements et Remboursements</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Méthode de Paiement:</strong> ONLYMATT accepte les paiements via PayPal en mode sandbox (test).
              </p>
              <p>
                <strong>Frais:</strong> Aucun frais supplémentaire n'est facturé en plus des prix affichés. Les frais PayPal 
                sont couverts par ONLYMATT.
              </p>
              <p>
                <strong>Remboursements:</strong> Les remboursements sont traités selon la politique PayPal (30 jours après achat). 
                Les points dépensés ne peuvent pas être remboursés.
              </p>
              <p>
                <strong>Sécurité:</strong> Tous les paiements sont vérifiés avec des checksums cryptographiques pour garantir 
                l'authenticité.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">6. Conduites Interdites</h2>
            <p className="text-gray-300 mb-4">
              Vous acceptez de ne pas:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Utiliser des bots ou des scripts pour automatiser les spins</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Créer plusieurs comptes pour contourner les limites de taux</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Tenter de pirater ou de manipuler le système</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Utiliser des proxies ou VPN pour contourner les restrictions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Partager votre compte avec d'autres personnes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-blue font-bold">✗</span>
                <span>Harceler ou intimider d'autres utilisateurs</span>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">7. Résiliation et Suspension</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                ONLYMATT se réserve le droit de suspendre ou de résilier votre compte immédiatement si:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Vous violez ces conditions d'utilisation</li>
                <li>• Vous tentez de pirater ou de manipuler le système</li>
                <li>• Vous utilisez des bots ou scripts automatisés</li>
                <li>• Vous partagez votre compte avec d'autres</li>
                <li>• Vous êtes moins de 18 ans</li>
              </ul>
              <p className="mt-4">
                En cas de suspension, toutes les transactions en cours seront annulées. Les points ne seront pas remboursés 
                (sauf si requis par la loi).
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="neon-border-pink glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-pink mb-4">8. Non-Responsabilité</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                ONLYMATT n'est pas responsable de:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Les pertes ou dommages causés par une utilisation indirecte ou fortuite</li>
                <li>• Les pertes de points dues à un compte supprimé</li>
                <li>• Les pannes de serveur ou les temps d'arrêt</li>
                <li>• Les erreurs de paiement (sauf si confirmées par PayPal)</li>
                <li>• Les abus du système de jeu responsable</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section className="neon-border-blue glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-blue mb-4">9. Modifications des Conditions</h2>
            <p className="text-gray-300">
              ONLYMATT peut modifier ces conditions à tout moment. Les modifications entreront en vigueur dès la publication 
              sur cette page. Votre utilisation continue de la plateforme après les modifications signifie que vous acceptez 
              les nouvelles conditions.
            </p>
          </section>

          {/* Section 10 */}
          <section className="neon-border-yellow glass-dark rounded-3xl p-8">
            <h2 className="text-2xl font-black text-neon-yellow mb-4">10. Contact & Support</h2>
            <p className="text-gray-300 mb-4">
              Si vous avez des questions sur ces conditions, veuillez contacter notre support:
            </p>
            <div className="bg-dark-navy rounded-lg p-4 border border-neon-yellow/30">
              <p><strong>Email:</strong> support@onlymatt.ca</p>
              <p className="text-sm text-gray-400 mt-2">Réponse en 24-48 heures</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
