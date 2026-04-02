import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/security/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async overall() {
    return this.healthService.getOverallHealth();
  }

  @Public()
  @Get('platform')
  async platform() {
    return this.healthService.getPlatformHealth();
  }

  @Public()
  @Get('tenant')
  async tenant() {
    return this.healthService.getTenantHealth();
  }
}
