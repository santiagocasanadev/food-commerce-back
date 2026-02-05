import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CustomersService } from '../application/customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get(':customerId')
  async get(@Param('customerId') customerId: string) {
    const customer = await this.service.get(customerId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
