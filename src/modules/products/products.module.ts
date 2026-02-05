import { Module, Post } from '@nestjs/common';
import { ProductsController } from './api/products.controller';
import { ProductsService } from './application/products.service';
import { AdminProductsController } from './admin/admin-products.controller';
import { PostgresProductRepository } from './infrastructure/product.repository.postgres';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [
    ProductsService,
    {
      provide: 'ProductsRepository',
      useClass: PostgresProductRepository ,
    },
  ],
})
export class ProductsModule {}
