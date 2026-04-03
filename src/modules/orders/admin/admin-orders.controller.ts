import { Controller, Patch, Param, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';
import { TENANT_BACKOFFICE_ROLES } from 'src/security/roles.enum';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Roles } from 'src/security/decorators/roles.decorator';
import { AuditInterceptor } from 'src/infrastructure/logging/audit.interceptor';

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(...TENANT_BACKOFFICE_ROLES)
@Controller('admin/orders')
export class AdminOrdersController {
    constructor(private readonly service: OrdersService) { }

    @Get()
    listOrders() {
        return this.service.list();
    }

    @Patch(':orderId/status')
    advance(@Param('orderId') orderId: string) {
        return this.service.advance(orderId);
    }

}
