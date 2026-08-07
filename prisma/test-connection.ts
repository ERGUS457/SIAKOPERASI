// Script test koneksi database
// Jalankan: npx tsx prisma/test-connection.ts

import { Pool } from "pg";
import "dotenv/config";

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log("DATABASE_URL exists:", !!connectionString);
  console.log("URL preview:", connectionString?.substring(0, 40) + "...");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query("SELECT NOW() as time, current_database() as db");
    console.log("✅ Database connected successfully!");
    console.log("   Time:", result.rows[0].time);
    console.log("   Database:", result.rows[0].db);

    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("\n📋 Tables in database:");
    tables.rows.forEach((row: any) => console.log("   -", row.table_name));
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
