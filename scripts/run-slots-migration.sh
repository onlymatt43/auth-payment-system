#!/bin/bash

set -e
cd "$(dirname "$0")/.." || exit 1

if [ -f ".env.local" ]; then
  set -a
  source ./.env.local
  set +a
fi

npm run db:migrate
