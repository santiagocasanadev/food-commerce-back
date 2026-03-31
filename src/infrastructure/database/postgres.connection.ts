import { Pool } from 'pg';
import { getDbCredentials } from './postgres.secrets';

let pool: Pool | null = null;

export async function initPostgres(): Promise<void> {
  const connectionString = process.env.DATABASE_URL?.trim();

  const connectionConfig = connectionString
    ? {
        connectionString,
      }
    : await buildConnectionConfigFromSecret();

  pool = new Pool({
    ...connectionConfig,
    ssl: {
      rejectUnauthorized: false,
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

async function buildConnectionConfigFromSecret() {
  if (!process.env.DB_SECRET_NAME) {
    throw new Error(
      'Postgres config missing. Define DATABASE_URL or DB_SECRET_NAME.',
    );
  }

  const creds = await getDbCredentials();

  return {
    host: creds.host,
    port: creds.port,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
  };
}
