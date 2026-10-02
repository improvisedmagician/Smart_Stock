const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres' });
async function run() {
  await pool.query('UPDATE tb_usuario SET nome = $1 WHERE email = $2', ['Estoquista João', 'operador@smartstock.com']);
  console.log('Nome corrigido!');
  process.exit(0);
}
run();
