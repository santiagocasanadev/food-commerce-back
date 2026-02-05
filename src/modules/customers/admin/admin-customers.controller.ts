import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CustomersService } from '../application/customers.service';

@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get(':customerId')
  async getProfile(@Param('customerId') customerId: string) {
    const customer = await this.service.get(customerId);
    if (!customer) throw new NotFoundException();
    return customer;
  }
}
