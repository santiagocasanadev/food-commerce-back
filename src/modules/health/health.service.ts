import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { getPlatformPool } from 'src/infrastructure/database/platform.connection';
import { getPgPool } from 'src/infrastructure/database/postgres.connection';
import { getTenantContext } from 'src/infrastructure/database/tenant-context';

@Injectable()
export class HealthService {
  async getOverallHealth() {
    const [platform, tenant] = await Promise.allSettled([
      this.getPlatformHealth(),
      this.getTenantHealth(),
    ]);

    return {
      status:
        platform.status === 'fulfilled' &&
        tenant.status === 'fulfilled' &&
        platform.value.status === 'ok' &&
        tenant.value.status === 'ok'
          ? 'ok'
          : 'degraded',
      platform:
        platform.status === 'fulfilled'
          ? platform.value
          : {
              status: 'error',
              message: platform.reason instanceof Error
                ? platform.reason.message
                : String(platform.reason),
            },
      tenant:
        tenant.status === 'fulfilled'
          ? tenant.value
          : {
              status: 'error',
              message: tenant.reason instanceof Error
                ? tenant.reason.message
                : String(tenant.reason),
            },
      checkedAt: new Date().toISOString(),
    };
  }

  async getPlatformHealth() {
    try {
      await getPlatformPool().query('SELECT 1');

      return {
        status: 'ok',
        scope: 'platform',
        checkedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throw new ServiceUnavailableException({
        status: 'error',
        scope: 'platform',
        message:
          error instanceof Error ? error.message : 'Platform database is unavailable',
      });
    }
  }

  async getTenantHealth() {
    const tenantContext = getTenantContext();

    try {
      await getPgPool().query('SELECT 1');

      return {
        status: 'ok',
        scope: 'tenant',
        tenantId: tenantContext?.tenantId ?? null,
        tenantSlug: tenantContext?.tenantSlug ?? null,
        source: tenantContext?.source ?? 'default',
        checkedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throw new ServiceUnavailableException({
        status: 'error',
        scope: 'tenant',
        tenantId: tenantContext?.tenantId ?? null,
        tenantSlug: tenantContext?.tenantSlug ?? null,
        source: tenantContext?.source ?? 'default',
        message:
          error instanceof Error ? error.message : 'Tenant database is unavailable',
      });
    }
  }
}
