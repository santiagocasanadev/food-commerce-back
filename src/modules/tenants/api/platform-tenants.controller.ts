import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Role } from 'src/security/roles.enum';
import { PlatformTenantsService } from '../application/platform-tenants.service';
import { PlatformTenantConnectionService } from '../application/platform-tenant-connection.service';
import { PlatformTenantOnboardingService } from '../application/platform-tenant-onboarding.service';
import { CreatePlatformTenantDto } from '../dto/create-platform-tenant.dto';
import { OnboardPlatformTenantDto } from '../dto/onboard-platform-tenant.dto';
import { TestPlatformTenantConnectionDto } from '../dto/test-platform-tenant-connection.dto';
import { UpdatePlatformTenantDto } from '../dto/update-platform-tenant.dto';

@UseGuards(RolesGuard)
@Roles(Role.PLATFORM_ADMIN)
@Controller('platform/tenants')
export class PlatformTenantsController {
  constructor(
    private readonly platformTenantsService: PlatformTenantsService,
    private readonly platformTenantConnectionService: PlatformTenantConnectionService,
    private readonly platformTenantOnboardingService: PlatformTenantOnboardingService,
  ) {}

  @Get()
  list() {
    return this.platformTenantsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.platformTenantsService.get(id);
  }

  @Post()
  create(@Body() dto: CreatePlatformTenantDto) {
    return this.platformTenantsService.create(dto);
  }

  @Post('test-connection')
  testConnection(@Body() dto: TestPlatformTenantConnectionDto) {
    return this.platformTenantConnectionService.testConnection(dto);
  }

  @Post('onboard')
  onboard(@Body() dto: OnboardPlatformTenantDto) {
    return this.platformTenantOnboardingService.onboardTenant(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlatformTenantDto) {
    return this.platformTenantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformTenantsService.remove(id);
  }
}
