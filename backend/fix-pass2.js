const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" });
async function run() {
  const hash = await bcrypt.hash("admin123", 10);
  console.log("New Hash for admin123:", hash);
  const client = await pool.connect();
  await client.query("UPDATE Usuario SET senha_hash = $1", [hash]);
  client.release();
  process.exit(0);
}
run();
