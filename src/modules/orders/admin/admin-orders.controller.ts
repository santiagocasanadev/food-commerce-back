import { Controller, Patch, Param, Get } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';

@Controller('admin/orders')
export class AdminOrdersController {
    constructor(private readonly service: OrdersService) { }

    @Get()
    list() {
        return this.service.list();
    }

    @Patch(':orderId/status')
    advance(@Param('orderId') orderId: string) {
        return this.service.advance(orderId);
    }

}
