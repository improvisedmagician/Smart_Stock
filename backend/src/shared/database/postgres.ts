import { Pool } from 'pg';
import { env } from '../config/env';

export const pgPool = new Pool({
  user: env.POSTGRES_USER,
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB,
  password: env.POSTGRES_PASSWORD,
  port: env.POSTGRES_PORT,
});

export const connectPostgres = async () => {
  try {
    await pgPool.query('SELECT 1');
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error('PostgreSQL connection error', error);
    process.exit(1);
  }
};
