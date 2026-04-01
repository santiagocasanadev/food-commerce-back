import { Module } from '@nestjs/common';
import { PlatformTenantsService } from './application/platform-tenants.service';
import { PlatformTenantsController } from './api/platform-tenants.controller';
import { TenantRegistryService } from './application/tenant-registry.service';
import { PlatformTenantRepository } from './infrastructure/platform-tenant.repository.postgres';

@Module({
  controllers: [PlatformTenantsController],
  providers: [
    TenantRegistryService,
    PlatformTenantsService,
    PlatformTenantRepository,
  ],
  exports: [TenantRegistryService],
})
export class TenantsModule {}
