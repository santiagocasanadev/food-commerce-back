import { Controller, Get, Param } from '@nestjs/common';
import { LoyaltyService } from '../application/loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @Get(':customerId')
  get(@Param('customerId') customerId: string) {
    return this.service.get(customerId);
  }
}
