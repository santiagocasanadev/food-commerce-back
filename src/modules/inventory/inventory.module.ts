import { Module, Post } from '@nestjs/common';
import { InventoryController } from './api/inventory.controller';
import { InventoryService } from './application/inventory.service';
import { AdminInventoryController } from './admin/admin-inventory.controller';
import { PostgresInventoryRepository } from './infrastructure/inventory.repository.postgres';

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
    InventoryService
  ],
    exports: ['InventoryRepository'],
})
export class InventoryModule {}
