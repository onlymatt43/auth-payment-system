#!/usr/bin/env node

/**
 * Deprecated wrapper.
 * Use: npm run db:migrate
 */

const { spawnSync } = require('node:child_process');
const result = spawnSync('node', ['scripts/db-migrate.js'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
