const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.secvimcyoqqwpkrcznwi',
  password: '7NPvzALpWy2qFJE2'
});
pool.query('SELECT NOW()', (err, res) => {
  if(err) { console.error('Connection failed:', err.message); }
  else { 
    console.log('Connection successful!');
    const sql = fs.readFileSync('../docker/postgres/init.sql', 'utf8');
    pool.query(sql, (err2, res2) => {
      if(err2) { console.error('SQL init failed:', err2.message); }
      else { console.log('Tables created successfully!'); }
      pool.end();
    });
  }
});
