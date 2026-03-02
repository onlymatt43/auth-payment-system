import client from "../lib/turso";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    console.log("🚀 Starting slot machine system migration...");

    const sqlPath = path.join(__dirname, "setup-slots-system.sql");
    const sqlFile = fs.readFileSync(sqlPath, "utf-8");

    // Split SQL statements and execute them
    const statements = sqlFile
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      console.log(`📝 Executing: ${statement.substring(0, 60)}...`);
      try {
        await client.execute(statement);
        console.log("  ✅ Success");
      } catch (error: any) {
        // Table might already exist, which is fine with IF NOT EXISTS
        if (error?.message?.includes("already exists") || error?.message?.includes("UNIQUE")) {
          console.log("  ℹ️  Already exists, skipping");
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nCreated tables:");
    console.log("- user_spins: Records each slot spin with results");
    console.log("- daily_free_spins: Tracks free spin eligibility");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
