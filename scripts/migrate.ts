/**
 * Deprecated wrapper.
 * Use: npm run db:migrate
 */

import { spawnSync } from 'node:child_process';

const result = spawnSync('node', ['scripts/db-migrate.js'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
