import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  try {
    // Drop all tables in correct order (reverse of dependencies)
    await sql`DROP TABLE IF EXISTS booking_passenger CASCADE;`;
    await sql`DROP TABLE IF EXISTS booking CASCADE;`;
    await sql`DROP TABLE IF EXISTS session CASCADE;`;
    await sql`DROP TABLE IF EXISTS account CASCADE;`;
    await sql`DROP TABLE IF EXISTS seat CASCADE;`;
    await sql`DROP TABLE IF EXISTS passenger CASCADE;`;
    await sql`DROP TABLE IF EXISTS flight CASCADE;`;
    await sql`DROP TABLE IF EXISTS airline CASCADE;`;
    await sql`DROP TABLE IF EXISTS "user" CASCADE;`;

    // Drop enums
    await sql`DROP TYPE IF EXISTS seat_class CASCADE;`;
    await sql`DROP TYPE IF EXISTS payment_status CASCADE;`;
    await sql`DROP TYPE IF EXISTS booking_status CASCADE;`;

    console.log("✅ All tables and types dropped successfully");
    console.log("🔄 Now run 'pnpm db:push' to create the new schema");

  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log("Database reset completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database reset failed:", error);
    process.exit(1);
  });