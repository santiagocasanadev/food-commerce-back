export class PricingResult {
  constructor(
    readonly total: number,
    readonly appliedPromotions: string[]
  ) {}
}
