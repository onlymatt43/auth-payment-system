#!/bin/bash

set -e

echo "🚀 Database initialization"
echo "=========================="

if [ ! -f .env.local ]; then
  echo "ℹ️  .env.local not found. Creating minimal local defaults."
  cat > .env.local <<'ENVEOF'
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=dev-onlymatt-auth-secret-please-change-in-prod
NEXTAUTH_SECRET=dev-onlymatt-auth-secret-please-change-in-prod
ENVEOF
fi

set -a
source ./.env.local
set +a

npm run db:migrate

echo "✅ Database ready"
