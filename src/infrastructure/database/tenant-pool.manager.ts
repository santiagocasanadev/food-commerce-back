import { Logger } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { describeConnectionTarget } from 'src/modules/tenants/utils/masked-connection';

const tenantPools = new Map<string, Pool>();
const logger = new Logger('TenantPoolManager');
const RETRY_DELAYS_MS = [0, 300, 800];

export async function getOrCreateTenantPool(
  cacheKey: string,
  config: PoolConfig,
): Promise<Pool> {
  const existing = tenantPools.get(cacheKey);

  if (existing) {
    logger.debug(`Reusing tenant pool "${cacheKey}"`);
    return existing;
  }

  const target = config.connectionString
    ? describeConnectionTarget(config.connectionString)
    : {
        protocol: null,
        username: config.user ?? null,
        host: config.host ?? null,
        port: config.port?.toString() ?? null,
        database: config.database ?? null,
      };

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
      logger.log(
        JSON.stringify({
          scope: 'tenant-db',
          event: 'pool_connected',
          cacheKey,
          attempt: attempt + 1,
          target,
        }),
      );
      if (attempt > 0) {
        logger.warn(
          `Tenant pool "${cacheKey}" connected after retry ${attempt + 1}/${RETRY_DELAYS_MS.length}`,
        );
      }
      return pool;
    } catch (error: unknown) {
      lastError = error;
      await pool.end().catch(() => undefined);
      logger.warn(
        JSON.stringify({
          scope: 'tenant-db',
          event: 'pool_connection_failed',
          cacheKey,
          attempt: attempt + 1,
          maxAttempts: RETRY_DELAYS_MS.length,
          target,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
