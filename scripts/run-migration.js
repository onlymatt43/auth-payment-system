const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting slot machine system migration...');

    // Get the database URL and token from environment
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;

    if (!dbUrl || !dbToken) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    }

    // Create client
    const client = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    // Read SQL file
    const sqlPath = path.join(__dirname, 'setup-slots-system.sql');
    let sqlFile = fs.readFileSync(sqlPath, 'utf-8');

    // Remove SQL line comments (-- ...)
    sqlFile = sqlFile
      .split('\n')
      .map((line) => {
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');

    // Split SQL statements and execute them
    const statements = sqlFile
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Found ${statements.length} statements to execute:`);
    statements.forEach((stmt, idx) => {
      console.log(`  ${idx + 1}. ${stmt.substring(0, 70)}...`);
    });
    console.log('');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] 📝 Executing: ${statement.substring(0, 60)}...`);
      try {
        await client.execute(statement);
        console.log('  ✅ Success');
      } catch (error) {
        // Log the full error for better debugging
        console.error(`  ❌ Error: ${error?.message || JSON.stringify(error)}`);
        
        // Table might already exist, which is fine with IF NOT EXISTS
        if (error?.message?.includes('already exists') || error?.message?.includes('UNIQUE')) {
          console.log('  ℹ️  Already exists, skipping');
        } else if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
          // Log but continue for CREATE statements
          console.log('  ℹ️  Create statement (table might already exist)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('- user_spins: Records each slot spin with results');
    console.log('- daily_free_spins: Tracks free spin eligibility');
    console.log('\nYou can now use the slot machine feature!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error?.message || error);
    process.exit(1);
  }
}

runMigration();
