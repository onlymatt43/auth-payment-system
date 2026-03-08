# 🚀 Guide de Déploiement Production - Système de Points

## 📋 Prérequis

- [ ] Compte PayPal Business vérifié
- [ ] Compte Vercel ou Render
- [ ] Nom de domaine configuré (ex: points.onlymatt.ca)
- [ ] Base de données Turso déjà créée

---

## 1️⃣ PayPal - Mode Production

### Créer une application PayPal Live

1. **Aller sur PayPal Developer**
   - URL: https://developer.paypal.com/dashboard/
   - Se connecter avec compte Business

2. **Créer une application LIVE**
   - Apps & Credentials → Live
   - Create App
   - Nom: "OnlyMatt Points Production"
   - Type: Merchant

3. **Récupérer les credentials LIVE**
   ```
   Client ID: AXxxxxxxxxxxxxxxxxxxx
   Secret: EYxxxxxxxxxxxxxxxxxxx
   ```

4. **Configurer Webhooks (optionnel)**
   - Live Webhooks
   - URL: https://points.onlymatt.ca/api/paypal/webhook
   - Events: PAYMENT.CAPTURE.COMPLETED

### Variables d'environnement PayPal

```env
PAYPAL_CLIENT_ID=<votre_live_client_id>
PAYPAL_CLIENT_SECRET=<votre_live_secret>
PAYPAL_MODE=live
```

⚠️ **IMPORTANT**: Ne JAMAIS commiter les credentials live dans Git!

---

## 2️⃣ Google OAuth - Production

### Ajouter URLs de production

1. **Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Projet: auth-payment-system

2. **APIs & Services → Credentials**
   - Modifier "Web client 1"

3. **Authorized redirect URIs**
   - Ajouter: `https://points.onlymatt.ca/api/auth/callback/google`
   - Garder: `http://localhost:3001/api/auth/callback/google` (dev)

4. **Authorized JavaScript origins**
   - Ajouter: `https://points.onlymatt.ca`

### Variables d'environnement OAuth

```env
GOOGLE_CLIENT_ID=<votre_client_id>
GOOGLE_CLIENT_SECRET=<votre_client_secret>
NEXTAUTH_URL=https://points.onlymatt.ca
```

---

## 3️⃣ Déploiement sur Vercel

### A. Préparer le projet

1. **Créer fichier `vercel.json`** (si absent)
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "nextjs",
     "regions": ["iad1"]
   }
   ```

2. **Vérifier `.gitignore`**
   ```
   .env.local
   .env*.local
   node_modules/
   .next/
   ```

3. **Commit et Push sur GitHub**
   ```bash
   git add .
   git commit -m "Prepare production deployment"
   git push origin main
   ```

### B. Configurer Vercel

1. **Importer projet**
   - https://vercel.com/new
   - Import Git Repository
   - Sélectionner: auth-payment-system

2. **Configuration**
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

3. **Variables d'environnement**

   Aller dans Settings → Environment Variables → Production:

   ```env
   # PayPal
   PAYPAL_CLIENT_ID=<production_client_id>
   PAYPAL_CLIENT_SECRET=<production_secret>
   PAYPAL_MODE=live

   # Google OAuth
   GOOGLE_CLIENT_ID=<votre_client_id>
   GOOGLE_CLIENT_SECRET=<votre_client_secret>
   NEXTAUTH_URL=https://points.onlymatt.ca
   NEXTAUTH_SECRET=<générer_nouveau_secret_64_chars>

   # Security
   API_SECRET_KEY=<générer_nouveau_secret_64_chars>
   ADMIN_PASSWORD=<mot_de_passe_fort>

   # Turso Database
   TURSO_DATABASE_URL=libsql://project-links-onlymatt43.aws-us-east-2.turso.io
   TURSO_AUTH_TOKEN=<votre_token_turso>
   ```

   **Générer nouveaux secrets:**
   ```bash
   openssl rand -hex 32  # NEXTAUTH_SECRET
   openssl rand -hex 32  # API_SECRET_KEY
   ```

4. **Domaine personnalisé**
   - Settings → Domains
   - Add Domain: `points.onlymatt.ca`
   - Configurer DNS:
     ```
     Type: CNAME
     Name: points
     Value: cname.vercel-dns.com
     ```

5. **Déployer**
   - Deploy
   - Attendre build (~2-3 minutes)
   - Vérifier: https://points.onlymatt.ca

---

## 4️⃣ Déploiement project-links (consommateur)

### A. Variables d'environnement production

```env
# Points System API
AUTH_SYSTEM_URL=https://points.onlymatt.ca
AUTH_API_KEY=<même_API_SECRET_KEY_que_auth-payment-system>
NEXT_PUBLIC_AUTH_SYSTEM_URL=https://points.onlymatt.ca

# Turso (partagée)
TURSO_DATABASE_URL=libsql://project-links-onlymatt43.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=<votre_token>

# Autres configs existantes...
BUNNY_LIBRARY_ID=552081
BUNNY_API_KEY=...
```

### B. Déployer sur Vercel

1. Même processus que auth-payment-system
2. Domaine: `projects.onlymatt.ca` (ou existant)
3. Ajouter variables d'environnement production

---

## 5️⃣ Tests Production

### Checklist de tests

- [ ] **Accès boutique**: https://points.onlymatt.ca/shop
- [ ] **Login Google**: Tester authentification
- [ ] **Achat PayPal LIVE**: 
  - Acheter Pack Starter ($5 USD)
  - ⚠️ **VRAI paiement** sera effectué!
  - Vérifier crédit de points (Turso)
- [ ] **Historique**: https://points.onlymatt.ca/account
- [ ] **Admin**: https://points.onlymatt.ca/admin/points
- [ ] **Consommation**: Tester depuis project-links production
- [ ] **CORS**: Vérifier communication entre domaines

### Test avec montant minimal

Pour tester sans dépenser beaucoup:
1. Créer un package test 1pt = $0.01 dans l'admin
2. Acheter ce package
3. Tester consommation
4. Supprimer le package test

---

## 6️⃣ Monitoring & Sécurité

### A. Logs Vercel

- Dashboard Vercel → Logs
- Surveiller erreurs PayPal
- Vérifier transactions Turso

### B. PayPal Dashboard

- https://www.paypal.com/merchantapps/dashboard
- Vérifier transactions
- Surveiller disputes/chargebacks

### C. Sécurité

**Secrets à NE JAMAIS exposer:**
- ❌ PAYPAL_CLIENT_SECRET
- ❌ NEXTAUTH_SECRET
- ❌ API_SECRET_KEY
- ❌ ADMIN_PASSWORD
- ❌ TURSO_AUTH_TOKEN

**Best practices:**
- ✅ Utiliser HTTPS uniquement
- ✅ Variables d'environnement dans Vercel
- ✅ Secrets différents dev/prod
- ✅ Rotation régulière des secrets
- ✅ Logs des transactions (déjà implémenté)

---

## 7️⃣ Rollback Plan

### Si problème en production

1. **Désactiver PayPal temporairement**
   - Admin → Packages → Désactiver tous
   - Message maintenance sur /shop

2. **Revenir à version précédente**
   - Vercel Dashboard → Deployments
   - Click sur deployment précédent
   - Promote to Production

3. **Vérifier base de données**
   ```bash
   turso db shell project-links "SELECT * FROM user_balances;"
   turso db shell project-links "SELECT * FROM point_transactions ORDER BY created_at DESC LIMIT 10;"
   ```

---

## 8️⃣ Maintenance

### Sauvegardes Turso

```bash
# Export base de données
turso db shell project-links ".dump" > backup-$(date +%Y%m%d).sql

# Planifier backup hebdomadaire (cron)
0 0 * * 0 /usr/local/bin/turso db shell project-links ".dump" > ~/backups/turso-$(date +\%Y\%m\%d).sql
```

### Mises à jour

1. Tester en local (localhost:3001)
2. Commit sur branche `staging`
3. Déployer sur Preview (Vercel)
4. Tester preview
5. Merge dans `main` → Auto-deploy production

---

## 📞 Support

**Erreurs fréquentes:**

1. **PayPal "invalid_client"**
   - Vérifier PAYPAL_CLIENT_ID/SECRET
   - Confirmer PAYPAL_MODE=live

2. **Google OAuth error**
   - Vérifier redirect URIs
   - NEXTAUTH_URL correct

3. **CORS errors entre domaines**
   - Vérifier AUTH_SYSTEM_URL
   - Headers CORS dans Next.js

4. **Points non crédités**
   - Vérifier logs Vercel
   - Checker table point_transactions
   - Voir logs PayPal webhook

---

## ✅ Checklist finale avant Go-Live

- [ ] PayPal Live credentials configurées
- [ ] Google OAuth redirect URIs production ajoutés
- [ ] Tous les secrets regénérés pour production
- [ ] Variables d'environnement Vercel configurées
- [ ] Domaine DNS pointé correctement
- [ ] SSL/HTTPS actif (automatique Vercel)
- [ ] Test complet achat → crédit → dépense
- [ ] Backup Turso effectué
- [ ] Monitoring activé
- [ ] Plan rollback documenté

**Date de déploiement:** ___________________

**Déployé par:** ___________________

---

🎉 **Système prêt pour production!**
