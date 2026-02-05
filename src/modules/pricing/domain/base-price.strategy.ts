import { PricingInput } from "./pricing-input";
import { PricingResult } from "./pricing-result";
import { PricingStrategy } from "./pricing.strategy";

export class BasePriceStrategy implements PricingStrategy {
  apply(input: PricingInput): PricingResult {
    return new PricingResult(input.baseTotal, []);
  }
}