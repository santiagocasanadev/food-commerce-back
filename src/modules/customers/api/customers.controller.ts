import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CustomersService } from '../application/customers.service';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Public()
  @Get(':customerId')
  async get(@Param('customerId') customerId: string) {
    const customer = await this.service.get(customerId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
