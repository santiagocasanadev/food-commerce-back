import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { CustomersService } from '../application/customers.service';
import { Public } from 'src/security/decorators/public.decorator';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':customerId')
  async get(@Param('customerId') customerId: string) {
    const customer = await this.service.get(customerId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
