
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const pool = new Pool({ connectionString: "postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" });
async function run() {
  const hash = await bcrypt.hash("operador123", 10);
  const q = "INSERT INTO tb_usuario (nome, email, senha_hash, perfil_id, ativo) VALUES ($1, $2, $3, (SELECT id FROM tb_perfil_acesso WHERE nome = $4), true) ON CONFLICT (email) DO NOTHING";
  await pool.query(q, ["Estoquista João", "operador@smartstock.com", hash, "OPERADOR"]);
  console.log("Operador criado!");
  process.exit(0);
}
run();

