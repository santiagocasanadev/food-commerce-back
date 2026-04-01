import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomersModule } from '../customers/customers.module';
import { InventoryModule } from '../inventory/inventory.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CatalogModule,
    ProductsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    CustomersModule,
    LoyaltyModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    CatalogModule,
    ProductsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    CustomersModule,
    LoyaltyModule,
  ],
})
export class TenantAppModule {}
