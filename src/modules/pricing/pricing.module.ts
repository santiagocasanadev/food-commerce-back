import { Module } from "@nestjs/common";
import { PricingService } from "./application/pricing.service";
import { PricingContext } from "./application/pricing.context";
import { BasePriceStrategy } from "./domain/base-price.strategy";
import { PercentageDiscountStrategy } from "./domain/percentage-discount.strategy";
import { PointsDiscountStrategy } from "./domain/points-discount.strategy";
import { PRICING_STRATEGIES } from "./constants/pricing.constants";


@Module({
  providers: [
    PricingService,
    PricingContext,
    BasePriceStrategy,
    PercentageDiscountStrategy,
    PointsDiscountStrategy,
    {
      provide: PRICING_STRATEGIES,
      useFactory: (
        base: BasePriceStrategy,
        percentage: PercentageDiscountStrategy,
        points: PointsDiscountStrategy
      ) => [
        base,
        percentage,
        points
      ],
      inject: [
        BasePriceStrategy,
        PercentageDiscountStrategy,
        PointsDiscountStrategy
      ]
    }
  ],
  exports: [ PricingService ]
})
export class PricingModule {}

