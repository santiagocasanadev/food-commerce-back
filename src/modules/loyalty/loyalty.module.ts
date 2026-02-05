import { Module } from '@nestjs/common';
import { LoyaltyController } from './api/loyalty.controller';
import { LoyaltyService } from './application/loyalty.service';
import { AdminLoyaltyController } from './admin/admin-loyalty.controller';
import { PostgresLoyaltyRepository } from './infrastructure/loyalty.repository.postgres';

@Module({
  controllers: [LoyaltyController, AdminLoyaltyController],
  providers: [
    LoyaltyService,
    {
      provide: 'LoyaltyRepository',
      useClass: PostgresLoyaltyRepository ,
    },
  ],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
