import { Pool } from 'pg';
import { getDbCredentials } from './postgres.secrets';

let platformPool: Pool | null = null;

export async function initPlatformPostgres(): Promise<void> {
  if (platformPool) {
    return;
  }

  const connectionString = (
    process.env.PLATFORM_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim()
  );

  const connectionConfig = connectionString
    ? {
        connectionString,
      }
    : await buildConnectionConfigFromSecret();

  platformPool = new Pool({
    ...connectionConfig,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  await platformPool.query('SELECT 1');
}

export function getPlatformPool(): Pool {
  if (!platformPool) {
    throw new Error('Platform Postgres pool not initialized');
  }

  return platformPool;
}

async function buildConnectionConfigFromSecret() {
  if (!process.env.DB_SECRET_NAME) {
    throw new Error(
      'Platform Postgres config missing. Define PLATFORM_DATABASE_URL, DATABASE_URL or DB_SECRET_NAME.',
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
