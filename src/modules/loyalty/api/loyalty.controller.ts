import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoyaltyService } from '../application/loyalty.service';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { RequestUser } from 'src/security/request-user';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':customerId')
  get(
    @Req() req: { user: RequestUser },
    @Param('customerId') customerId: string,
  ) {
    if (req.user.customerId !== customerId) {
      throw new ForbiddenException('You can only access your own loyalty account');
    }

    return this.service.get(customerId);
  }
}
