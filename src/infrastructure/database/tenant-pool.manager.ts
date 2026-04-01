import { Pool, PoolConfig } from 'pg';

const tenantPools = new Map<string, Pool>();

export async function getOrCreateTenantPool(
  cacheKey: string,
  config: PoolConfig,
): Promise<Pool> {
  const existing = tenantPools.get(cacheKey);

  if (existing) {
    return existing;
  }

  const pool = new Pool({
    ...config,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  await pool.query('SELECT 1');
  tenantPools.set(cacheKey, pool);
  return pool;
}
