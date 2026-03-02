#!/bin/bash

# Migration runner for Turso database
# This script sets up the slot machine system tables

cd "$(dirname "$0")/.." || exit 1

# Load environment variables from .env.local
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Run the migration using the Turso client
npx ts-node <<'EOF'
import client from "./lib/turso";
import fs from "fs";

async function runMigration() {
  try {
    console.log("🚀 Starting slot machine system migration...");

    const sqlFile = fs.readFileSync("./scripts/setup-slots-system.sql", "utf-8");
    
    // Split SQL statements and execute them
    const statements = sqlFile
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
      await client.execute(statement);
    }

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
EOF
