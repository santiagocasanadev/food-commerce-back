import { Logger } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';

const tenantPools = new Map<string, Pool>();
const logger = new Logger('TenantPoolManager');
const RETRY_DELAYS_MS = [0, 300, 800];

export async function getOrCreateTenantPool(
  cacheKey: string,
  config: PoolConfig,
): Promise<Pool> {
  const existing = tenantPools.get(cacheKey);

  if (existing) {
    return existing;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    const delayMs = RETRY_DELAYS_MS[attempt];

    if (delayMs > 0) {
      await sleep(delayMs);
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

    try {
      await pool.query('SELECT 1');
      tenantPools.set(cacheKey, pool);
      if (attempt > 0) {
        logger.warn(
          `Tenant pool "${cacheKey}" connected after retry ${attempt + 1}/${RETRY_DELAYS_MS.length}`,
        );
      }
      return pool;
    } catch (error) {
      lastError = error;
      await pool.end().catch(() => undefined);
      logger.warn(
        `Tenant pool "${cacheKey}" connection attempt ${attempt + 1}/${RETRY_DELAYS_MS.length} failed`,
      );
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
