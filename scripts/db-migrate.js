#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

function getClient() {
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const useAuth = !url.startsWith('file:');

  if (useAuth && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is not a local file URL');
  }

  return createClient({
    url,
    authToken: useAuth ? process.env.TURSO_AUTH_TOKEN : undefined,
    intMode: 'number',
  });
}

async function run() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  const client = getClient();

  let executed = 0;
  let skipped = 0;

  for (const statement of statements) {
    try {
      await client.execute(statement);
      executed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes('already exists') ||
        message.includes('duplicate') ||
        message.includes('UNIQUE constraint failed')
      ) {
        skipped += 1;
        continue;
      }
      throw error;
    }
  }

  // Post-migration repair: dedupe seed artifacts and enforce package uniqueness.
  await client.execute(`
    DELETE FROM point_packages
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM point_packages
      GROUP BY name, points, price_usd, active
    )
  `);

  await client.execute(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_point_packages_unique ON point_packages(name, points, price_usd, active)'
  );

  // Business normalization:
  // 1) hide invalid free-price packages
  await client.execute(
    `UPDATE point_packages SET active = 0 WHERE active = 1 AND price_usd <= 0`
  );

  // 2) enforce the second active package at $10 (ordered by points asc)
  await client.execute(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY points ASC, id ASC) AS rn
      FROM point_packages
      WHERE active = 1 AND price_usd > 0
    )
    UPDATE point_packages
    SET price_usd = 10.00
    WHERE id IN (SELECT id FROM ranked WHERE rn = 2)
  `);

  console.log(`db:migrate complete | executed=${executed} skipped=${skipped}`);
}

run().catch((error) => {
  console.error('db:migrate failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
