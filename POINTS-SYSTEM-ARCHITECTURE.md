# Architecture Système de Points OnlyMatt

## Vue d'ensemble

Boutique centralisée de points avec PayPal, solde global par email (Google Auth), consommation multi-projets.

## 🎯 Flux utilisateur

1. **Connexion Google** → Récupère email
2. **Achète points** → PayPal checkout → Webhook crédite solde
3. **Accède projet** → Vérifie solde → Dépense points → Session temporaire

## 📊 Base de données (Turso)

### `point_packages` - Packages vendus
```sql
CREATE TABLE point_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- "Pack Starter"
  points INTEGER NOT NULL,                -- 50
  price_usd REAL NOT NULL,                -- 5.00
  paypal_plan_id TEXT,                    -- ID PayPal produit
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `point_config` - Valeurs modulables
```sql
CREATE TABLE point_config (
  id INTEGER PRIMARY KEY,
  point_dollar_value REAL DEFAULT 0.10,  -- 1pt = 0.10$ (ajustable)
  point_minutes_value INTEGER DEFAULT 6, -- 1pt = 6min (ajustable pour promos)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `user_balances` - Soldes par email
```sql
CREATE TABLE user_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,            -- Google email
  points INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `point_transactions` - Historique
```sql
CREATE TABLE point_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  type TEXT NOT NULL,                    -- 'purchase', 'spend', 'refund'
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata TEXT,                         -- JSON: {project, paypal_order_id, etc.}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `project_costs` - Coût par projet
```sql
CREATE TABLE project_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL UNIQUE,     -- 'only-surrr'
  project_name TEXT NOT NULL,            -- 'ONLY SURRR'
  points_required INTEGER NOT NULL,      -- 10 points
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `sessions` - Sessions actives (déjà existe, à adapter)
```sql
-- Ajouter colonnes à table existante:
ALTER TABLE sessions ADD COLUMN email TEXT;
ALTER TABLE sessions ADD COLUMN points_spent INTEGER;
```

## 🔄 APIs

### auth-payment-system (Boutique)

#### `POST /api/paypal/create-order`
Crée ordre PayPal pour package de points
```json
{
  "package_id": 1,
  "email": "user@gmail.com"
}
```

#### `POST /api/paypal/webhook`
Webhook PayPal → crédite solde après paiement confirmé

#### `GET /api/balance?email=user@gmail.com`
Retourne solde actuel

#### `POST /api/admin/packages` (CRUD)
Gérer packages de points

#### `POST /api/admin/config` (UPDATE)
Ajuster valeur $ et temps des points

### project-links (Consommation)

#### `POST /api/points/validate`
Vérifie solde + dépense points + crée session
```json
{
  "email": "user@gmail.com",
  "project_slug": "only-surrr"
}
```
Retourne:
```json
{
  "success": true,
  "points_spent": 10,
  "balance_remaining": 40,
  "session_duration_minutes": 60,
  "session_expires_at": "2026-02-22T15:00:00Z"
}
```

## 🔐 Google Auth

- NextAuth.js avec Google Provider
- Email comme identifiant unique
- Pas de password, tout via OAuth

## 💰 PayPal Integration

- PayPal Commerce Platform (Orders API v2)
- Webhooks: `CHECKOUT.ORDER.APPROVED`
- Environnement: Sandbox → Production

## 🎨 Interfaces Admin

### auth-payment-system/admin

1. **Packages de points**
   - CRUD packages (nom, points, prix, PayPal ID)
   - Activer/désactiver

2. **Configuration globale**
   - Valeur $ par point (pour promos)
   - Valeur temps par point (pour promos)

3. **Transactions**
   - Historique achats
   - Recherche par email

### project-links/admin

1. **Coût des projets**
   - Définir combien de points par projet
   - Ajuster facilement

## 📈 Exemples de valeurs

### Packages par défaut
- Pack Starter: 50 points = 5$
- Pack Standard: 200 points = 15$ (économie 25%)
- Pack Premium: 500 points = 30$ (économie 40%)

### Valeurs normales
- 1 point = 0.10$ (ou ajusté pour promotions)
- 1 point = 6 minutes (ou ajusté pour promotions)

### Coûts projets
- ONLY SURRR: 10 points (= 1h normal, ou plus si promo temps)
- Super Vidéothèque: 50 points (= 5h normal)
- Only Coach: 20 points (= 2h normal)

## 🔒 Sécurité

- IP binding par session (déjà implémenté)
- Google Auth only (pas de passwords)
- Webhook PayPal signature verification
- Admin password protected
- Rate limiting sur APIs

## 🚀 Phases d'implémentation

1. ✅ Architecture définie
2. ⏳ Migration DB + tables
3. ⏳ PayPal SDK + APIs
4. ⏳ Google Auth (NextAuth.js)
5. ⏳ Admin interfaces
6. ⏳ Frontend boutique
7. ⏳ Intégration project-links
8. ⏳ Tests + déploiement
