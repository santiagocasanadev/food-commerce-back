import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';

@Module({
  imports: [CatalogModule, ProductsModule, InventoryModule, CartModule, OrdersModule, CustomersModule, LoyaltyModule]
})
export class AppModule {}
