import { PricingInput } from "./pricing-input";
import { PricingResult } from "./pricing-result";

export interface PricingStrategy {
  apply(input: PricingInput): PricingResult;
}
