import { Module } from '@nestjs/common';
import { CatalogController } from './api/catalog.controller';
import { CatalogService } from './application/catalog.service';
import { AdminCatalogController } from './admin/admin-catalog.controller';
import { PostgresCatalogRepository } from './infrastructure/catalog.repository.postgres';

@Module({
  controllers: [CatalogController, AdminCatalogController],
  providers: [
    CatalogService,{
      provide: 'CatalogRepository',
      useClass: PostgresCatalogRepository,
    }
  ]
})
export class CatalogModule {}
