import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule, HealthModule],
  exports: [TenantsModule, HealthModule],
})
export class PlatformModule {}
