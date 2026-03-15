import { Controller, Post, Param, Patch, Req, Body, UseGuards, Headers, Query, Get } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post()
  create(@Req() req, @Headers('Idempotency-Key') idempotencyKey: string, @Body() dto: CreateOrderDto) {
    return this.service.createFromCart(
      req.user.id,
      dto.pointsToUse ?? 0,
      idempotencyKey
    );
  }

  @Get()
  list(@Req() req, @Query() pagination: PaginationDto) {
    return this.service.listCustomerOrders(
      req.user.id,
      pagination.page ?? 1,
      pagination.limit ?? 10
    );
  }

}
