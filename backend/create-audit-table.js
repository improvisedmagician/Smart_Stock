const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" });
async function run() {
  await pool.query("CREATE TABLE IF NOT EXISTS tb_log_auditoria ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), usuario_id VARCHAR(255), usuario_nome VARCHAR(255), acao VARCHAR(50), tipo_entidade VARCHAR(50), entidade_id VARCHAR(255), valor_antigo JSONB, valor_novo JSONB, ip VARCHAR(50), criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );");
  console.log("Tabela de auditoria criada!");
  process.exit(0);
}
run();
