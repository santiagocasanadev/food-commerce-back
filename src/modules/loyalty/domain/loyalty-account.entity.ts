export class LoyaltyAccount {
  constructor(
    readonly customerId: string,
    private points: number = 0
  ) {}

  getPoints(): number {
    return this.points;
  }

  addPoints(pointsToAdd: number): void {
    if (pointsToAdd <= 0) {
      return;
    }

    this.points += pointsToAdd;
  }

  subtractPoints(pointsToRedeem: number): void {
    if (pointsToRedeem <= 0) {
      return;
    }

    if (this.points < pointsToRedeem) {
      throw new Error('Insufficient loyalty points');
    }

    this.points -= pointsToRedeem;
  }
}
