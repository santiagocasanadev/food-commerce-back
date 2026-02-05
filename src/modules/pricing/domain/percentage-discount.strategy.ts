import { PricingInput } from "./pricing-input";
import { PricingResult } from "./pricing-result";
import { PricingStrategy } from "./pricing.strategy";

export class PercentageDiscountStrategy implements PricingStrategy {
  constructor(private readonly percentage: number) {}

  apply(input: PricingInput): PricingResult {
    const discount = input.baseTotal * this.percentage;
    return new PricingResult(
      input.baseTotal - discount,
      [`${this.percentage * 100}%_DISCOUNT`]
    );
  }
}