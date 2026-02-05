import { Controller, Post, Param, Patch } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post(':customerId')
  create(@Param('customerId') customerId: string) {
    return this.service.createFromCart(customerId);
  }

  @Patch(':orderId/status')
  advance(@Param('orderId') orderId: string) {
    return this.service.advance(orderId);
  }
}
