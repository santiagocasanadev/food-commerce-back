import {
  Injectable,
  Logger,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { runWithTenantContext } from 'src/infrastructure/database/tenant-context';
import { TenantRegistryService } from '../application/tenant-registry.service';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantResolutionMiddleware.name);

  constructor(private readonly tenantRegistryService: TenantRegistryService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (this.shouldBypassTenantResolution(req.originalUrl)) {
      this.logger.debug(
        `Bypassing tenant resolution for ${req.method} ${req.originalUrl}`,
      );
      return runWithTenantContext(
        {
          tenantId: null,
          tenantSlug: null,
          pool: null,
          source: 'default',
        },
        () => next(),
      );
    }

    if (!this.tenantRegistryService.isEnabled()) {
      this.logger.debug(
        `Tenant resolution disabled for ${req.method} ${req.originalUrl}`,
      );
      return runWithTenantContext(
        {
          tenantId: null,
          tenantSlug: null,
          pool: null,
          source: 'default',
        },
        () => next(),
      );
    }

    const tenant = await this.tenantRegistryService.resolveTenantFromRequest({
      tenantId: req.header('x-tenant-id') ?? undefined,
      tenantSlug: req.header('x-tenant-slug') ?? undefined,
      host: req.hostname || req.header('host') || undefined,
    });

    if (!tenant) {
      this.logger.warn(
        `Tenant could not be resolved for ${req.method} ${req.originalUrl}`,
      );
      if (process.env.REQUIRE_TENANT_RESOLUTION === 'true') {
        return next(new NotFoundException('Tenant could not be resolved'));
      }

      return runWithTenantContext(
        {
          tenantId: null,
          tenantSlug: null,
          pool: null,
          source: 'default',
        },
        () => next(),
      );
    }

    if (!tenant.isActive()) {
      this.logger.warn(
        `Inactive tenant "${tenant.getSlug()}" blocked for ${req.method} ${req.originalUrl}`,
      );
      return next(new NotFoundException('Tenant is inactive'));
    }

    const pool = await this.tenantRegistryService.resolveTenantPool(
      tenant.getDbConnectionUrl(),
      tenant.id,
    );

    this.logger.debug(
      JSON.stringify({
        scope: 'tenant-resolution',
        event: 'tenant_resolved',
        method: req.method,
        path: req.originalUrl,
        tenantId: tenant.id,
        tenantSlug: tenant.getSlug(),
      }),
    );

    return runWithTenantContext(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.getSlug(),
        pool,
        source: 'registry',
      },
      () => next(),
    );
  }

  private shouldBypassTenantResolution(path: string) {
    return (
      path.startsWith('/api/v1/platform/') ||
      path.startsWith('/api/v1/health/platform') ||
      path.startsWith('/docs')
    );
  }
}
