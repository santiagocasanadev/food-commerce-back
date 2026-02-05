import { Module, Post } from '@nestjs/common';
import { OrdersController } from './api/orders.controller';
import { OrdersService } from './application/orders.service';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { AdminOrdersController } from './admin/admin-orders.controller';
import { SqliteOrderRepository } from './infrastructure/order.repository.sqlite';
import { PricingModule } from '../pricing/pricing.module';
import { PostgresOrderRepository } from './infrastructure/order.repository.postgres';

@Module({
  imports: [CartModule, InventoryModule, LoyaltyModule, PricingModule],
  controllers: [
    OrdersController,
    AdminOrdersController,
  ],
  providers: [
    OrdersService,
    {
      provide: 'OrderRepository',
      useClass: PostgresOrderRepository ,
    },
  ],
})
export class OrdersModule {}
