import { PricingStrategy } from '../domain/pricing.strategy';
import { PricingInput } from '../domain/pricing-input';
import { PricingResult } from '../domain/pricing-result';
import { Inject, Injectable } from '@nestjs/common';
import { PRICING_STRATEGIES } from '../constants/pricing.constants';


export class PricingContext {
  constructor(
    @Inject(PRICING_STRATEGIES)
    private readonly strategies: PricingStrategy[]
  ) {}

  calculate(input: PricingInput): PricingResult {
    return this.strategies.reduce(
      (result, strategy) =>
        strategy.apply(
          new PricingInput(result.total, input.pointsToUse)
        ),
      new PricingResult(input.baseTotal, [])
    );
  }
}
