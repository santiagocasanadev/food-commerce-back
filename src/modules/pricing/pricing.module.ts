import { Module } from "@nestjs/common";
import { PricingService } from "./application/pricing.service";
import { PricingContext } from "./application/pricing.context";
import { BasePriceStrategy } from "./domain/base-price.strategy";
import { PercentageDiscountStrategy } from "./domain/percentage-discount.strategy";
import { PointsDiscountStrategy } from "./domain/points-discount.strategy";


@Module({
  providers: [
    PricingService,
    {
      provide: PricingContext,
      useFactory: () =>
        new PricingContext([
          new BasePriceStrategy(),
          new PercentageDiscountStrategy(0.1),
          new PointsDiscountStrategy()
        ])
    }
  ],
  exports: [PricingService, PricingContext],
})
export class PricingModule {}
