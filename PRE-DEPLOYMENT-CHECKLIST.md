# ✅ Checklist Pré-Déploiement

**Date:** ___________________  
**Responsable:** ___________________

---

## 1. PayPal Production

- [ ] Compte PayPal Business vérifié
- [ ] Application Live créée sur developer.paypal.com
- [ ] Client ID Live récupéré
- [ ] Client Secret Live récupéré
- [ ] Testé en sandbox (déjà fait ✓)

---

## 2. Google OAuth

- [ ] Redirect URI production ajouté: `https://points.onlymatt.ca/api/auth/callback/google`
- [ ] JavaScript origin ajouté: `https://points.onlymatt.ca`
- [ ] Credentials dev conservés (localhost:3001)

---

## 3. Secrets Production

Exécuter: `./scripts/generate-production-secrets.sh`

- [ ] NEXTAUTH_SECRET généré
- [ ] API_SECRET_KEY généré
- [ ] ADMIN_PASSWORD défini
- [ ] Secrets sauvegardés dans gestionnaire mots de passe
- [ ] ⚠️ Secrets DIFFÉRENTS de dev

---

## 4. Vercel Configuration

### Projet auth-payment-system

- [ ] Projet importé depuis GitHub
- [ ] Framework détecté: Next.js
- [ ] Variables d'environnement:
  - [ ] PAYPAL_CLIENT_ID (live)
  - [ ] PAYPAL_CLIENT_SECRET (live)
  - [ ] PAYPAL_MODE=live
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET (nouveau)
  - [ ] API_SECRET_KEY (nouveau)
  - [ ] ADMIN_PASSWORD (nouveau)
  - [ ] TURSO_DATABASE_URL
  - [ ] TURSO_AUTH_TOKEN

### Projet project-links

- [ ] Variables d'environnement:
  - [ ] AUTH_SYSTEM_URL=https://points.onlymatt.ca
  - [ ] AUTH_API_KEY (même que API_SECRET_KEY)
  - [ ] NEXT_PUBLIC_AUTH_SYSTEM_URL=https://points.onlymatt.ca
  - [ ] TURSO_DATABASE_URL
  - [ ] TURSO_AUTH_TOKEN
  - [ ] (autres variables existantes...)

---

## 5. DNS & Domaines

- [ ] Domaine personnalisé ajouté dans Vercel
- [ ] DNS CNAME configuré:
  ```
  points.onlymatt.ca → cname.vercel-dns.com
  ```
- [ ] SSL/HTTPS actif (auto Vercel)
- [ ] Certificat valide

---

## 6. Base de Données

- [ ] Backup Turso effectué:
  ```bash
  turso db shell project-links ".dump" > backup-pre-prod.sql
  ```
- [ ] Tables vérifiées:
  - [ ] point_packages (3 packages minimum)
  - [ ] user_balances (vide OK)
  - [ ] point_transactions (vide OK)
  - [ ] project_costs (3 projets minimum)
  - [ ] point_config (1 row)

---

## 7. Tests Production

### ⚠️ ATTENTION: Vrais paiements!

- [ ] Accès boutique: https://points.onlymatt.ca/shop
- [ ] Login Google fonctionne
- [ ] Packages affichés correctement
- [ ] **Test achat minimal** (Pack Starter $5):
  - [ ] Redirection PayPal OK
  - [ ] Paiement complété
  - [ ] Points crédités dans Turso
  - [ ] Historique visible
- [ ] Admin accessible: https://points.onlymatt.ca/admin/points
- [ ] Configuration modifiable (test)
- [ ] Consommation depuis project-links fonctionne
- [ ] Session créée correctement

---

## 8. Monitoring

- [ ] Logs Vercel actifs
- [ ] PayPal Dashboard accessible
- [ ] Alertes email configurées (Vercel)
- [ ] Sentry/monitoring (optionnel)

---

## 9. Documentation

- [ ] DEPLOYMENT-PRODUCTION.md lu
- [ ] Équipe informée du déploiement
- [ ] Plan rollback documenté
- [ ] Contacts d'urgence définis

---

## 10. Sécurité

- [ ] .env.local dans .gitignore
- [ ] Aucun secret dans Git
- [ ] HTTPS uniquement
- [ ] Secrets production != dev
- [ ] Mot de passe admin fort

---

## 🚨 Rollback Plan

Si problème:

1. **Vercel**: Deployments → Version précédente → Promote
2. **PayPal**: Admin → Désactiver tous les packages
3. **Vérifier DB**: `turso db shell project-links "SELECT * FROM user_balances;"`

---

## ✅ Go/No-Go

**Tous les points cochés?**

- [ ] ✓ OUI → **GO POUR PRODUCTION** 🚀
- [ ] ✗ NON → Compléter points manquants

**Signature:** ___________________  
**Date/Heure Go-Live:** ___________________

---

## 📞 Support Post-Déploiement

**Première heure:** Surveillance active  
**Premier jour:** Vérifications régulières  
**Première semaine:** Monitoring quotidien

**Contacts d'urgence:**
- Vercel Support: support@vercel.com
- PayPal Developer: https://developer.paypal.com/support/
- Turso: support@turso.tech
