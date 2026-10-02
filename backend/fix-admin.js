const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.secvimcyoqqwpkrcznwi',
  password: '7NPvzALpWy2qFJE2'
});
async function fix() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@smartstock.com']);
  console.log('Password fixed!');
  pool.end();
}
fix();
