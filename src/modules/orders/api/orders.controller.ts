import { Controller, Post, Param, Patch, Req, Body, UseGuards, Headers } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { Role } from 'src/security/roles.enum';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post()
  create(@Req() req, @Headers('Idempotency-Key') idempotencyKey: string, @Body() body) {
    return this.service.createFromCart(
      req.user.id,
      body.pointsToUse ?? 0,
      idempotencyKey
    );
  }
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':orderId/status')
  advance(@Param('orderId') orderId: string) {
    return this.service.advance(orderId);
  }


}
