import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';
import { PlatformAuthModule } from '../platform-auth/platform-auth.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule, HealthModule, PlatformAuthModule],
  exports: [TenantsModule, HealthModule, PlatformAuthModule],
})
export class PlatformModule {}
