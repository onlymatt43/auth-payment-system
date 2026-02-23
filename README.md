# OnlyMatt Points (PayPal + Google OAuth + Turso)

Système de boutique de points (Next.js 16) avec achats PayPal, login Google et base partagée Turso.

## ✨ Fonctionnalités
- Achat de points via PayPal (Live ou Sandbox)
- Auth Google (NextAuth v5) sans mot de passe
- Solde unique par email, transactions historisées
- Admin points/packages/projets
- API consommable par `project-links`

## 🧱 Stack
- Next.js 16 (App Router) · TypeScript
- Turso (libSQL) partagé (`project-links-onlymatt43…`)
- PayPal REST v2 (Checkout Orders)
- NextAuth v5 (Google)
- Pino logger, Axios

## 🔑 Variables d'env (production)
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live          # ou sandbox pour tests
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://points.onlymatt.ca
NEXTAUTH_SECRET=...
API_SECRET_KEY=...
ADMIN_PASSWORD=...
TURSO_DATABASE_URL=libsql://project-links-onlymatt43.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=...
```

## 🚀 Démarrer en local
1) `npm install`
2) Copier `.env.local` (mode sandbox) avec vos valeurs
3) `npm run dev` (http://localhost:3001)

## 🌐 Déploiement Vercel
1) Définir les variables ci-dessus dans Vercel (Production)
2) Choisir `PAYPAL_MODE` selon besoin (sandbox pour tests, live pour réel)
3) `git push` → build auto

Docs détaillées :
- DEPLOYMENT-PRODUCTION.md
- PRE-DEPLOYMENT-CHECKLIST.md

## 🔎 Dépannage rapide
- PayPal `invalid_client` : Client ID/Secret ne correspondent pas au mode choisi (Live vs Sandbox) ou mal copiés.
- Turso 401/400 : vérifier `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` (DB `project-links` + token complet).
- Google OAuth : redirect URI `https://points.onlymatt.ca/api/auth/callback/google` doit être ajouté dans la console Google.

## 📂 Endpoints principaux
- `GET /api/packages` : liste des packages
- `POST /api/paypal/create-order` : créer une commande PayPal
- `POST /api/paypal/capture` : capturer et créditer les points
- `GET /api/account` : profil + transactions
- `GET /api/balance` : solde

## ✅ Statut actuel
- Turso opérationnel (project-links)
- Auth Google OK
- PayPal : nécessite des credentials Live/Sandbox valides dans Vercel (voir tests avec /api/test-paypal si réactivé en debug)
