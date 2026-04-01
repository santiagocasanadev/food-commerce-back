import {
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { runWithTenantContext } from 'src/infrastructure/database/tenant-context';
import { TenantRegistryService } from '../application/tenant-registry.service';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly tenantRegistryService: TenantRegistryService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (!this.tenantRegistryService.isEnabled()) {
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
      return next(new NotFoundException('Tenant is inactive'));
    }

    const pool = await this.tenantRegistryService.resolveTenantPool(
      tenant.getDbConnectionUrl(),
      tenant.id,
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
}
