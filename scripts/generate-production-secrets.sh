#!/bin/bash

# Script pour générer les secrets de production
# Usage: ./scripts/generate-production-secrets.sh

echo "🔐 Génération des secrets pour production..."
echo ""
echo "=================================="
echo "SECRETS À CONFIGURER DANS VERCEL"
echo "=================================="
echo ""

echo "1️⃣ NEXTAUTH_SECRET:"
NEXTAUTH_SECRET=$(openssl rand -hex 32)
echo "$NEXTAUTH_SECRET"
echo ""

echo "2️⃣ API_SECRET_KEY:"
API_SECRET_KEY=$(openssl rand -hex 32)
echo "$API_SECRET_KEY"
echo ""

echo "3️⃣ ADMIN_PASSWORD (suggestion):"
ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
echo "$ADMIN_PASSWORD"
echo ""

echo "=================================="
echo "⚠️  IMPORTANT:"
echo "=================================="
echo "1. Copiez ces valeurs dans Vercel Environment Variables"
echo "2. Ne les commitez JAMAIS dans Git"
echo "3. Sauvegardez-les dans un gestionnaire de mots de passe"
echo "4. Ces secrets sont DIFFÉRENTS de ceux en développement"
echo ""

echo "📋 Variables à configurer dans Vercel:"
echo ""
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "API_SECRET_KEY=$API_SECRET_KEY"
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo ""
echo "✅ Secrets générés avec succès!"
