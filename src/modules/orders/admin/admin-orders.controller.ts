import { Controller, Patch, Param, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { Role } from 'src/security/roles.enum';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Roles } from 'src/security/decorators/roles.decorator';
import { AuditInterceptor } from 'src/infrastructure/logging/audit.interceptor';

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN) // Asegura que el guardia de roles se aplique a este controlador
@Controller('admin/orders')
export class AdminOrdersController {
    constructor(private readonly service: OrdersService) { }

    @Roles(Role.ADMIN)
    @Get()
    listOrders() {
        return this.service.list();
    }

    @Patch(':orderId/status')
    advance(@Param('orderId') orderId: string) {
        return this.service.advance(orderId);
    }

}
