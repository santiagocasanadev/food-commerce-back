import { PricingContext } from './pricing.context';
import { PricingInput } from '../domain/pricing-input';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  constructor(private readonly context: PricingContext) {}

  calculate(baseTotal: number, points: number) {
    return this.context.calculate(new PricingInput(baseTotal, points));
  }
}
