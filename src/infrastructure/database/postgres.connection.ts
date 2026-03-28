import { Pool } from 'pg';

let pool: Pool | null = null;

export async function initPostgres(): Promise<void> {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // clave para Supabase
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  await pool.query('SELECT 1');
}

export function getPgPool(): Pool {
  if (!pool) {
    throw new Error('Postgres pool not initialized');
  }
  return pool;
}