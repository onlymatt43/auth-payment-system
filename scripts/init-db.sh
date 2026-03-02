#!/bin/bash

# ============================================================================
# Database Initialization Script - Turso/SQLite
# ============================================================================
# This script initializes your OnlySLUT database with all required tables
# 
# Requirement: You need Turso CLI installed
# Install: brew install tursodatabase/tap/turso  (Mac)
#          Or visit: https://turso.tech/cli
#
# Usage:
#   chmod +x scripts/init-db.sh
#   ./scripts/init-db.sh
# ============================================================================

set -e

echo "🚀 OnlySLUT Database Initialization"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please create .env.local with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN"
    exit 1
fi

# Load env vars
export $(cat .env.local | grep -v '^#' | xargs)

if [ -z "$TURSO_DATABASE_URL" ]; then
    echo "❌ Error: TURSO_DATABASE_URL not set in .env.local"
    exit 1
fi

echo "📦 Database: $TURSO_DATABASE_URL"
echo ""

# Check if turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "⚠️  Turso CLI not found. Install it:"
    echo "   brew install tursodatabase/tap/turso"
    echo ""
    echo "Alternatively, you can:"
    echo "   1. Go to https://turso.tech/dashboard"
    echo "   2. Select your database"
    echo "   3. Go to 'Shell'"
    echo "   4. Copy-paste the contents of scripts/init-database.sql"
    exit 1
fi

echo "🔄 Running migrations..."
echo ""

# Execute SQL file
turso db shell "$TURSO_DATABASE_URL" < scripts/init-database.sql

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Your database now has all required tables"
echo "   2. Run: npm run dev"
echo "   3. Go to: http://localhost:3001"
echo "   4. Sign in with Google"
echo "   5. Play your first spin! 🎰"
echo ""
