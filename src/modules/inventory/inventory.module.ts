import { Module } from '@nestjs/common';
import { InventoryController } from './api/inventory.controller';
import { InventoryService } from './application/inventory.service';
import { AdminInventoryController } from './admin/admin-inventory.controller';
import { PostgresInventoryRepository } from './infrastructure/inventory.repository.postgres';
import { PostgresProductRepository } from '../products/infrastructure/product.repository.postgres';

@Module({
  controllers: [
    InventoryController,
    AdminInventoryController,
  ],
  providers: [InventoryService,
    {
      provide: 'InventoryRepository',
      useClass: PostgresInventoryRepository ,
    },
    {
      provide: 'ProductsRepository',
      useClass: PostgresProductRepository,
    }
  ],
    exports: ['InventoryRepository'],
})
export class InventoryModule {}
