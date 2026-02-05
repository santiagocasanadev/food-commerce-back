export class PricingInput {
  constructor(
    readonly baseTotal: number,
    readonly pointsToUse: number = 0
  ) {}
}
