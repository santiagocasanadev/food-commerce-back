import { Controller, Post, Param, Patch, Req, Body } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Public()
  @Post()
  create(@Req() req, @Body() body) {
    return this.service.createFromCart(
      req.user.id,
      body.pointsToUse ?? 0
    );
  }
  
  @Public()
  @Patch(':orderId/status')
  advance(@Param('orderId') orderId: string) {
    return this.service.advance(orderId);
  }
}
