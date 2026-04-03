import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from '../application/customers.service';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { RequestUser } from 'src/security/request-user';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':customerId')
  async get(
    @Req() req: { user: RequestUser },
    @Param('customerId') customerId: string,
  ) {
    if (req.user.customerId !== customerId) {
      throw new ForbiddenException('You can only access your own customer profile');
    }

    const customer = await this.service.get(customerId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
