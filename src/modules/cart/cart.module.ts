import { Module, Post } from '@nestjs/common';
import { CartController } from './api/cart.controller';
import { CartService } from './application/cart.service';
import { PricingModule } from '../pricing/pricing.module';
import { PostgresCartRepository } from './infrastructure/cart.repository.postgres';

@Module({
  imports: [PricingModule],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: 'CartRepository',
      useClass: PostgresCartRepository,
    },
  ],
  exports: ['CartRepository'],
})
export class CartModule {}
