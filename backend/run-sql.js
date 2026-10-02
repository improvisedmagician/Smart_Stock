const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.secvimcyoqqwpkrcznwi',
  password: '7NPvzALpWy2qFJE2'
});
async function run() {
  try {
    let sql = fs.readFileSync('../docker/postgres/init_v2.sql', 'utf8');
    sql = sql.replace(/^\uFEFF/, '');
    await pool.query(sql);
    console.log('New schema applied successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
