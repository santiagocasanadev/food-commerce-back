import { PricingInput } from "./pricing-input";
import { PricingResult } from "./pricing-result";
import { PricingStrategy } from "./pricing.strategy";

export class PointsDiscountStrategy implements PricingStrategy {
  apply(input: PricingInput): PricingResult {
    const discount = Math.min(input.pointsToUse, input.baseTotal);
    return new PricingResult(
      input.baseTotal - discount,
      ['POINTS_DISCOUNT']
    );
  }
}
