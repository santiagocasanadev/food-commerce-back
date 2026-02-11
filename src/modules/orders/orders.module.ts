import { Module } from '@nestjs/common';
import { OrdersController } from './api/orders.controller';
import { OrdersService } from './application/orders.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PostgresOrderRepository } from './infrastructure/order.repository.postgres';
import { UnitOfWork } from 'src/infrastructure/database/unit-of-work';
import { PostgresCartRepository } from '../cart/infrastructure/cart.repository.postgres';
import { PostgresLoyaltyRepository } from '../loyalty/infrastructure/loyalty.repository.postgres';
import { LoyaltyService } from '../loyalty/application/loyalty.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    InventoryModule,
    PricingModule
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    UnitOfWork,
    {
      provide: 'OrderRepository',
      useClass: PostgresOrderRepository
    },
    {
      provide: 'CartRepository',
      useClass: PostgresCartRepository
    },
    {
      provide: 'LoyaltyRepository',
      useClass: PostgresLoyaltyRepository
    },
    LoyaltyService
  ]
})
export class OrdersModule {}

