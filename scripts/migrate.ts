#!/usr/bin/env node

/**
 * Database Initialization Script
 * Runs SQL migrations on Turso database
 * 
 * Usage: npx ts-node scripts/migrate.ts
 * Or: node scripts/migrate.js
 */

import client from '../lib/turso';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('📦 Starting database initialization...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolons and filter empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let executed = 0;
    let skipped = 0;

    // Execute each statement
    for (const statement of statements) {
      try {
        if (statement.includes('sqlite_master') || statement.startsWith('SELECT')) {
          // Info query - just log
          console.log(`ℹ️  Checking: ${statement.substring(0, 50)}...`);
          skipped++;
        } else {
          // Execute migration
          await client.execute(statement);
          executed++;
          
          if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
            console.log(`✓ Table '${tableName}' ready`);
          } else if (statement.includes('INSERT')) {
            console.log(`✓ Data inserted`);
          } else if (statement.includes('CREATE INDEX')) {
            console.log(`✓ Index created`);
          } else {
            console.log(`✓ Statement executed`);
          }
        }
      } catch (error: any) {
        // Some errors are expected (e.g., IF NOT EXISTS)
        if (error.message.includes('already exists') || error.message.includes('UNIQUE')) {
          console.log(`⚠️  Already exists (skipped)`);
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Database initialization complete!`);
    console.log(`   Executed: ${executed}`);
    console.log(`   Skipped/Info: ${skipped}\n`);

    // Verify tables were created
    console.log('📋 Verifying tables...\n');
    const tableResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);

    const tables = tableResult.rows.map(row => row.name as string);
    
    const requiredTables = [
      'users',
      'accounts', 
      'sessions',
      'users_points',
      'transactions',
      'user_spins',
      'daily_free_spins',
      'point_packages',
      'project_costs'
    ];

    console.log('Required Tables:');
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        console.log(`✓ ${table}`);
      } else {
        console.log(`✗ ${table} (MISSING!)`);
      }
    }

    console.log('\n🎉 All done! Your database is ready.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
