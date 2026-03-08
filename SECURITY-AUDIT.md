# 🔒 Analyse de Sécurité - Système de Points & Slots

## Executive Summary

**Status**: ⚠️ **Majoritairement Sécurisé** avec **3 failles critiques** et **5 problèmes mineurs** à corriger.

| Type | Count | Severity |
|------|-------|----------|
| ✅ Bonnes pratiques | 8 | - |
| ⚠️ Améliorations recommandées | 5 | Moyen |
| 🔴 Failles critiques | 3 | Critique |

---

## ✅ Sécurité Existante (Robuste)

### 1. Authentication & Authorization
```typescript
// ✅ Correctement sécurisé
const session = await auth(); // NextAuth
if (!session?.user?.email) {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
```
- **Niveau**: Excellent
- NextAuth gère les sessions de manière sécurisée
- OAuth2 via Google (pas de stockage de mots de passe)
- Tokens HTTP-Only

### 2. SQL Injection Prevention
```typescript
// ✅ Résis tant aux injections SQL
await client.execute({
  sql: 'UPDATE users SET points = points + ? WHERE id = ?',
  args: [amount, userId],  // Paramètres séparés
});
```
- **Niveau**: Excellent
- Tous les queries utilisent prepared statements (args séparés du SQL)
- @libsql/client utilise binding automatique
- Pas de string concatenation

### 3. Balance Validation (Slots)
```typescript
// ✅ Vérification robuste
if (currentPoints < amount) {
  throw new Error('Insufficient points');
}
await client.execute('UPDATE users SET points = points - ?', [amount, userId]);
```
- **Niveau**: Bon
- Vérification avant débit
- Montants validés côté serveur
- Pas de montants négatifs possibles

### 4. Payment Verification (PayPal)
```typescript
// ✅ Vérification multi-étapes
if (capture.status !== 'COMPLETED') {
  throw new Error('Payment not completed');
}

// Vérification email
if (email !== session.user.email) {
  throw new Error('Email mismatch');
}
```
- **Niveau**: Très bon
- PayPal API vérifie la signature du paiement
- Vérification email pour éviter les transferts de points
- Status validé avant crédition

### 5. Session Isolation
- Chaque utilisateur ne peut voir/modifier que son propre solde
- Les points ne peuvent être transférés entre utilisateurs
- Transactions enregistrées pour audit

### 6. Admin Password Hashing (Partiellement)
```typescript
// ⚠️ Problématique (voir section critique)
const password = req.headers.get('x-admin-password');
if (password === process.env.ADMIN_PASSWORD) { ... }
```

### 7. Custom Data Validation (PayPal)
```typescript
// ✅ Validation du custom_id
const customData = JSON.parse(customId); // Avec try-catch
const { package_id, email, points } = customData;
```

### 8. Transaction Logging
Toutes les opérations points sont enregistrées pour audit:
```sql
INSERT INTO transactions (user_id, type, points, metadata)
VALUES (?, 'slots_win', ?, ?)
```

---

## 🔴 FAILLES CRITIQUES (À Corriger Immédiatement)

### 1. Admin Password en Plain Text

**Problème**:
```typescript
// 🔴 DANGEREUX
const password = req.headers.get('x-admin-password');
if (password === process.env.ADMIN_PASSWORD) { ... }
```

**Risques**:
- Envoyé en plain text sur HTTP (avant HTTPS)
- Visible dans les logs
- Reproductible à partir des logs
- Une seule couche de sécurité

**Solution Recommandée**:
```typescript
// ✅ Meilleur: Utiliser NextAuth avec role admin
export const authConfig = {
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = auth?.user?.role === 'admin';
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      
      if (isAdminRoute && !isAdmin) {
        return false;
      }
      return true;
    },
  },
};
```

**Implémentation**:
1. Ajouter colonne `role` (enum: 'user', 'admin') à table `users`
2. Stocker role dans NextAuth session
3. Vérifier sur chaque endpoint admin
4. Support OAuth pour admins aussi

**Délai Critique**: ⏰ **ASAP** (avant production)

---

### 2. Pas de Rate Limiting

**Problème**:
Un utilisateur pourrait faire des milliers de spins par seconde:

```javascript
// Attaque possible (aucune limitation)
for (let i = 0; i < 10000; i++) {
  await fetch('/api/slots/spin', {
    method: 'POST',
    body: JSON.stringify({ payWithPoints: false })
  });
}
```

**Risques**:
- Abuse des free spins (bypass 24h cooldown avec script)
- Génération infinie de points
- Déni de service (DOS)
- Coûts de base de données explosifs

**Solution Recommandée**:
```typescript
// ✅ Ajouter rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 spins par heure
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const { success } = await ratelimit.limit(session.user.email);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many spins. Try again later.' },
      { status: 429 }
    );
  }
  // ...
}
```

**Alternativement (sans dépendances externes)**:
```typescript
// Simple in-memory rate limiting
const spinAttempts = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = spinAttempts.get(email) || [];
  
  // Garder seulement les tentatives de la dernière heure
  const recent = attempts.filter(t => now - t < 3600000);
  
  if (recent.length >= 5) {
    return false; // Trop de spins
  }
  
  recent.push(now);
  spinAttempts.set(email, recent);
  return true;
}
```

**Délai Critique**: ⏰ **ASAP** (avant production)

---

### 3. Pas de HTTPS Forcé

**Problème**:
L'application fonctionne sur HTTP en développement et peut exposer:
- Tokens NextAuth
- Mots de passe admin
- IDs de commandes PayPal
- Tokens d'authentification

**Risques**:
- Man-in-the-middle attacks
- Interception de tokens
- Vol d'identité
- Compromission PayPal

**Solution Recommandée**:

**En production (Vercel)**:
```typescript
// next.config.ts
export default {
  // Vercel force HTTPS automatiquement en production
  // Ajouter des en-têtes de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.paypal.com",
          },
        ],
      },
    ];
  },
};
```

**En développement local**:
- Accepter HTTP seulement sur localhost:3000
- HTTPS obligatoire sur points.onlymatt.ca

**Délai Critique**: ⏰ **Avant la première production** (actuellement OK sur points.onlymatt.ca)

---

## ⚠️ PROBLÈMES MINEURS (À Corriger)

### 1. Email comme Identifiant Principal

**Problème**:
Les points sont liés à l'email plutôt qu'au user_id NextAuth

```typescript
// Tables désynchronisées
SELECT points FROM users WHERE email = ?  // Table users avec user_id
SELECT * FROM user_spins WHERE user_id = ?  // Deux systèmes différents
```

**Risques**:
- Incohérence si une personne change d'email
- Ambiguïté si deux providers OAuth utilisent le même email
- Difficile à maintenir

**Solution**:
```typescript
// Normaliser: user_id comme clé primaire partout
// users.id → emails.id → points.user_id → spins.user_id
// Un seul système de référence
```

**Impact**: 🟡 Moyen (Refactoring, pas de bug actuel)

---

### 2. Logs Sans Redaction

**Problème**:
```typescript
console.error('Spin error:', error);  // Peut logguer des données sensibles
```

**Risques**:
- Révélation d'emails en logs
- Montants sensibles visibles
- Infos PayPal en logs d'erreur

**Solution**:
```typescript
// Redacter les logs sensibles
function sanitizeForLogging(error: any) {
  const message = error?.message?.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );
  return message || 'Unknown error';
}

console.error('Spin error:', sanitizeForLogging(error));
```

**Impact**: 🟡 Moyen (Bug potentiel d'information disclosure)

---

### 3. Pas de Checksum PayPal

**Problème**:
```typescript
// Validation minimaliste
const { package_id, email, points } = customData;
// Pas de vérification que points correspond à package_id
```

**Risques**:
- Client pourrait modifier les points avant calcul
- Pas d'intégrité vérifiée

**Solution**:
```typescript
// Vérifier que le montant correspond au package
const packageInfo = await db.query('SELECT points FROM packages WHERE id = ?', [package_id]);

if (points !== packageInfo.points) {
  throw new Error('Points mismatch - potential tampering');
}
```

**Impact**: 🟡 Moyen (Trust issue)

---

### 4. Timeout Sessions API (Manquant)

**Problème**:
Les sessions admin n'ont pas de timeout:
```typescript
// Admin password jamais expire
if (password === process.env.ADMIN_PASSWORD) {
  // Forever valid
}
```

**Solution**:
```typescript
// Ajouter expiration avec JWT
const adminToken = signJWT({ role: 'admin' }, { expiresIn: '1h' });

// Vérifier et renouveler
const decoded = verifyJWT(token);
if (decoded.exp < Date.now()) {
  return NextResponse.json({ error: 'Session expired' }, { status: 401 });
}
```

**Impact**: 🟡 Moyen (Pas immédiat mais important)

---

### 5. Pas de Validation des Montants Admin

**Problème**:
```typescript
// Admin peut mettre n'importe quel montant
await client.execute(
  'UPDATE point_config SET point_dollar_value = ?',
  [userInput] // Pas de validation
);
```

**Solution**:
```typescript
if (dollarValue < 0 || dollarValue > 100) {
  throw new Error('Invalid dollar value');
}

if (minutesValue < 0 || minutesValue > 1440) {
  throw new Error('Invalid minutes value');
}
```

**Impact**: 🟡 Mineur (Intégrité de données)

---

## 📋 Checklist de Sécurité

### ✅ En Place
- [x] Authentication via NextAuth/OAuth
- [x] SQL injection prevention (prepared statements)
- [x] Balance verification before debit
- [x] Payment verification (PayPal)
- [x] Email verification (user identity)
- [x] Transaction logging for audit
- [x] HTTPS on production (Vercel)
- [x] No negative points possible

### 🔴 Critique (ASAP)
- [ ] Remplacer admin password par NextAuth role
- [ ] Ajouter rate limiting sur /api/slots/spin
- [ ] Forcer HTTPS globalement

### ⚠️ Important (Ce mois)
- [ ] Normaliser user_id vs email
- [ ] Redacter logs sensibles
- [ ] Ajouter checksum PayPal
- [ ] Timeout sessions admin
- [ ] Valider montants admin

### 📚 À Documenter
- [ ] Politique de sécurité
- [ ] Incident response plan
- [ ] Encryption de données sensibles (future)

---

## 🚀 Implémentation des Fixes

### Priority 1 (Cette semaine):
```bash
# 1. Admin role via NextAuth
# 2. Rate limiting sur slots
# 3. HTTPS headers
```

### Priority 2 (Ce mois):
```bash
# 4. Refactoring user_id
# 5. Log sanitization
# 6. PayPal checksums
```

### Priority 3 (Prochains mois):
```bash
# 7. Token expiration
# 8. Advanced monitoring
# 9. Encryption at rest
```

---

## Références de Sécurité

- OWASP Top 10: https://owasp.org/Top10/
- OWASP API Security: https://owasp.org/www-project-api-security/
- NextAuth Security: https://next-auth.js.org/getting-started/deployment
- PayPal Security: https://developer.paypal.com/api/rest/

---

## Conclusion

✅ **Base solide** avec authentification et validation de points correctes.

🔴 **3 problèmes critiques** doivent être corrigés avant production.

⏰ **Délai recommended**: 1 semaine pour fixes essentiels.

La sécurité globale: **7/10** → **9.5/10** après corrections.
