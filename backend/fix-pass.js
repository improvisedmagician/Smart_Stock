const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" });
async function run() {
  const client = await pool.connect();
  try {
    await client.query("UPDATE Usuario SET senha_hash = '$2b$10$EIXe0.EfGKz5xB6Q6xK6AeQYDB0VJ6Xz0jN5fGnE6S1z0LzRfhXCu' WHERE email = 'admin@smartstock.com'");
    
    // Also create the Operator
    await client.query("INSERT INTO Usuario (nome, email, senha_hash, perfil) VALUES ('Estoquista João', 'operador@smartstock.com', '$2b$10$EIXe0.EfGKz5xB6Q6xK6AeQYDB0VJ6Xz0jN5fGnE6S1z0LzRfhXCu', 'OPERADOR') ON CONFLICT DO NOTHING");

    console.log("Passwords fixed");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}
run();
