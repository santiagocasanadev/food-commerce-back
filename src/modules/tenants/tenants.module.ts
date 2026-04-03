import { Module } from '@nestjs/common';
import { BcryptPasswordHasher } from '../auth/infrastructure/security/bcrypt-password-hasher';
import { PlatformTenantConnectionService } from './application/platform-tenant-connection.service';
import { PlatformTenantOnboardingService } from './application/platform-tenant-onboarding.service';
import { PlatformTenantsService } from './application/platform-tenants.service';
import { PlatformTenantsController } from './api/platform-tenants.controller';
import { TenantRegistryService } from './application/tenant-registry.service';
import { PlatformTenantRepository } from './infrastructure/platform-tenant.repository.postgres';

@Module({
  controllers: [PlatformTenantsController],
  providers: [
    TenantRegistryService,
    PlatformTenantsService,
    PlatformTenantConnectionService,
    PlatformTenantOnboardingService,
    PlatformTenantRepository,
    BcryptPasswordHasher,
  ],
  exports: [TenantRegistryService],
})
export class TenantsModule {}
