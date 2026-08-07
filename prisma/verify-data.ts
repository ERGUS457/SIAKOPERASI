import { Pool } from "pg";
import "dotenv/config";

async function verifyData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const orgs = await pool.query('SELECT id, nama FROM "Organisasi"');
    console.log("✅ Organisasi:", orgs.rows);

    const users = await pool.query('SELECT id, nama, email, username FROM "User"');
    console.log("✅ Users:", users.rows);

    const akun = await pool.query('SELECT COUNT(*) as total FROM "Akun"');
    console.log("✅ Total Akun:", akun.rows[0].total);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

verifyData();
