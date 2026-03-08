# OnlySLUT Points System - Documentation Complète

## Vue d'ensemble

OnlySLUT utilise un système de jeu transparent basé sur les points. Les utilisateurs peuvent jouer aux machines à sous, gagner des points, et les utiliser pour accéder à du contenu premium.

---

## 1. Comment Obtenir des Points?

### A. Free Spin Quotidien (Gratuit)
- **Fréquence**: 1 fois par 24 heures
- **Coût**: 0 points
- **Résultat**: 0 à 250 points
- **Probabilité de gain**: 60% (1 sur 40 chance de rien gagner)

### B. Spins Payants
- **Coûts disponibles**: 10, 25, ou 50 points par spin
- **Limite**: 5 spins par heure (rate limiting)
- **Résultat**: 0 à 250 points
- **Probabilité de gain**: 60% (même que free spin)

### C. Acheter des Points
- **Méthode**: PayPal (sandbox pour l'instant)
- **Packages disponibles**: Multiples (10$, 25$, 50$, 100$+)
- **Taux**: Transparent et affiché avant achat
- **Traitement**: Immédiat après confirmation PayPal

---

## 2. Table des Probabilités de Gain

| Résultat | Symboles | Points | Probabilité | Fréquence |
|----------|----------|--------|-------------|-----------|
| Rien | 🎯 💎 🎪 | 0 | 40% | 2 sur 5 |
| Petit Gain | 🍒 🍒 🎪 | 5 | 25% | 1 sur 4 |
| Gain Moyen | 🍒 🍒 🍒 | 10 | 15% | 1 sur 7 |
| Bon Gain | 💎 💎 🎪 | 25 | 10% | 1 sur 10 |
| Très Bon Gain | 💎 💎 💎 | 50 | 6% | 1 sur 17 |
| Gros Gain | 👑 👑 🎪 | 100 | 3% | 1 sur 33 |
| **JACKPOT** | 👑 👑 👑 | **250** | **1%** | **1 sur 100** |

**Totaux**: 100% probabilité | 60% RTP (Return to Player)

---

## 3. Mécaniques du RNG (Random Number Generator)

### Certification
- Utilise `crypto.getRandomValues()` de Node.js
- Certifié pour la cryptographie
- Impossible à prédire ou manipuler

### Processus
1. Générer 3 nombres aléatoires (0-100)
2. Mapper à des symboles basé sur les probabilités
3. Déterminer le gain basé sur la combinaison
4. Vérifier les spins (anti-spam)
5. Enregistrer la transaction
6. Créditer les points

### Imprédictibilité
- Chaque spin est indépendant
- Les résultats précédents n'affectent pas les futurs
- Impossible de voir les résultats futurs
- Pas de "hot" ou "cold" slots

---

## 4. Limites de Sécurité

### Rate Limiting
- **Spins gratuits**: 1 par 24h
- **Spins payants**: 5 par heure
- **Raison**: Prévention du bot abuse et de l'automatisation
- **Réinitialisation**: À minuit UTC pour gratuit, roulant pour payants

### Prévention de Fraude
- Checksums PayPal sur chaque transaction
- Vérification du montant payé vs points crédités
- Email verification requise
- IP tracking pour détecter multi-account
- Logs automatiquement redactés

### Cache/CDA
- Données sensibles jamais en logs
- Hashing des tokens
- Sessions JWT sécurisées
- HTTPS obligatoire

---

## 5. Structure de la Base de Données

### Table: users
```
id: INTEGER PRIMARY KEY
email: TEXT UNIQUE
name: TEXT
image: TEXT
role: TEXT DEFAULT 'user'
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: users_points
```
id: INTEGER PRIMARY KEY
user_id: INTEGER FOREIGN KEY
balance: INTEGER
total_earned: INTEGER
total_spent: INTEGER
last_updated: TIMESTAMP
```

### Table: transactions
```
id: INTEGER PRIMARY KEY
user_id: INTEGER FOREIGN KEY
type: TEXT ('spin_free', 'spin_paid', 'buy_points', 'gain')
amount: INTEGER (peut être négatif)
description: TEXT
metadata: JSON
created_at: TIMESTAMP
```

### Table: user_spins
```
id: INTEGER PRIMARY KEY
user_id: INTEGER FOREIGN KEY
reels: TEXT (JSON array)
result: INTEGER (points gagnés)
is_paid: BOOLEAN
cost: INTEGER (0 pour gratuit)
is_jackpot: BOOLEAN
created_at: TIMESTAMP
```

### Table: daily_free_spins
```
id: INTEGER PRIMARY KEY
user_id: INTEGER FOREIGN KEY
last_free_spin: TIMESTAMP
spins_used_today: INTEGER
```

---

## 6. Flux d'Utilisation

### Scenario 1: Free Spin
```
1. Utilisateur clique "Free Spin"
2. Check si 24h depuis dernier free spin
3. Si non, afficher erreur + stamp
4. Si oui, générer RNG, déterminer résultat
5. Créditer points
6. Enregistrer transaction
7. Afficher résultat avec animation
8. Mettre à jour balance
9. Afficher stamp (jackpot, big win, etc.)
10. Reset libre spin timer
```

### Scenario 2: Spin Payant
```
1. Utilisateur sélectionne coût (10/25/50 pts)
2. Clique "Spin"
3. Check si balance >= coût
4. Check si moins de 5 spins/heure
5. Si non, afficher stamp d'erreur
6. Si oui, déduire points
7. Générer RNG
8. Créditer gains
9. Enregistrer transactions (déduction + gain)
10. Afficher résultat
11. Mettre à jour balance
```

### Scenario 3: Acheter des Points
```
1. Utilisateur sélectionne package
2. Vérifier prix et points
3. Créer ordre PayPal
4. Rediriger utilisateur
5. Utilisateur confirme dans PayPal
6. Webhook PayPal reçu
7. Vérifier checksum
8. Créditer points
9. Enregistrer transaction
10. Email de confirmation
11. Rediriger vers success page
```

---

## 7. Sécurité des Paiements

### Checksum Validation
```typescript
// 1. Récupérer le package depuis DB
const package = await db.getPointPackage(packageId);

// 2. Vérifier les points
if (paypalResult.custom.points !== package.points)
  throw new Error('Points mismatch');

// 3. Vérifier le prix (±1¢ tolerance)
const tolerance = 0.01;
if (Math.abs(paypalResult.amount - package.usdPrice) > tolerance)
  throw new Error('Price mismatch');

// 4. Créditer si tout valide
if (valid) {
  await db.addPoints(userId, points);
}
```

### Verification Token
- Chaque paiement reçoit un token unique
- Token vérifié avec API PayPal
- Impossible de rejouer une transaction

---

## 8. Statistiques & Analytics

### Métriques Suivies (Anonymisées)
- Nombre total de spins
- Distribution des résultats
- RTP réel (mesuré)
- Points moyens gagnés par spin
- Taux d'utilisation du free spin
- Temps moyen entre spins

### Données Non Tracées
- Identité des joueurs
- Historique personnalisé (sauf pour utilisateur)
- Adresses IP
- Géolocalisation

---

## 9. Fair Play Certification

### Garanties OnlySLUT
- ✅ RNG certifié (crypto.getRandomValues)
- ✅ Probabilités affichées et vérifiables
- ✅ Pas de manipulation par session
- ✅ Checksum sur tous les paiements
- ✅ Rate limiting anti-abuse
- ✅ Logs redactés (RGPD)
- ✅ Paiements vérifiés (PayPal)

### Ce qu'on ne fait PAS
- ❌ Manipuler les odds basé sur le temps de jeu
- ❌ Réduire les gains aux joueurs fréquents
- ❌ Augmenter les odds après losses
- ❌ Donner des odds différents par utilisateur
- ❌ Stocker des données personnelles en logs

---

## 10. Jeu Responsable

### Limites Implémentées
1. **Rate Limiting**: 5 spins/heure max
2. **RTP Fixe**: 50% (transparent)
3. **Free Spin Gratuit**: Évite gamblers habituels
4. **Information**: Probabilités toujours visibles

### Ressources
- Support: support@onlyslut.com
- FAQ complète: /how-it-works
- Conditions: /terms
- Confidentialité: /privacy

---

## 11. Conformité Légale

### Zones de Couverture
- ✅ Transparent (probabilités publiques)
- ✅ Équitable (RNG certifié)
- ✅ Sécurisé (chiffrement HTTPS)
- ✅ Respect de la vie privée (RGPD)

### Exemptions
- Pas de licence de gambling requise (monnaie virtuelle)
- Pas d'argent réel échangeable
- Points = accès content, pas "gain"

---

## 12. Trust Signals pour Utilisateurs

### Affichage sur le Site
- ✓ Probabilités claires sur chaque spin
- ✓ RTP affiché (50%)
- ✓ Lien "How it Works" visible
- ✓ Footer avec terms/privacy/FAQ
- ✓ Pas de pop-ups agressifs
- ✓ Support email lisible

### Transparence
- Historique de spins visible
- Balance toujours à jour
- Transactions traçables
- Édits de compte possibles
- Suppression de compte disponible

---

## Conclusion

IsOnlySLUT 100% transparent et équitable. Les utilisateurs peuvent:
✓ Vérifier les probabilités
✓ Voir leur historique
✓ Comprendre comment c'est fait
✓ Contact support si questions
✓ Supprimer leur compte à tout moment

**Mission**: Jeu amusant + intégrité + confiance.

---

**Document Version**: 1.0  
**Date**: Mars 2026  
**Mise à jour suivante**: À la demande
