import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { getDbCredentials } from './postgres.secrets';

let pool: Pool | null = null;

export async function initPostgres(): Promise<void> {
  const creds = await getDbCredentials();

  pool = new Pool({
    host: creds.host,
    port: creds.port,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(
        path.join(process.cwd(), 'certs', 'global-bundle.pem')
      ).toString()
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  // Smoke test obligatorio
  await pool.query('SELECT 1');
}

export function getPgPool(): Pool {
  if (!pool) {
    throw new Error('Postgres pool not initialized');
  }
  return pool;
}
