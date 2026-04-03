import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Role } from 'src/security/roles.enum';

@UseGuards(RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post()
  create(@Req() req, @Headers('Idempotency-Key') idempotencyKey: string, @Body() dto: CreateOrderDto) {
    return this.service.createFromCart(
      req.user.customerId,
      dto.pointsToUse ?? 0,
      idempotencyKey
    );
  }

  @Get()
  list(@Req() req, @Query() pagination: PaginationDto) {
    return this.service.listCustomerOrders(
      req.user.customerId,
      pagination.page ?? 1,
      pagination.limit ?? 10
    );
  }

}
