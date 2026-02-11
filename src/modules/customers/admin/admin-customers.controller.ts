import { Controller, Get, Param, NotFoundException, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomersService } from '../application/customers.service';
import { Role } from 'src/security/roles.enum';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Roles } from 'src/security/decorators/roles.decorator';
import { AuditInterceptor } from 'src/infrastructure/logging/audit.interceptor';

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly service: CustomersService) {}

  @Roles(Role.ADMIN)
  @Get(':customerId')
  async getProfile(@Param('customerId') customerId: string) {
    const customer = await this.service.get(customerId);
    if (!customer) throw new NotFoundException();
    return customer;
  }
}
