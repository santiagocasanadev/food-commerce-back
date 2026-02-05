export class LoyaltyAccount {
  constructor(
    readonly customerId: string,
    private points: number = 0
  ) {}

  getPoints(): number {
    return this.points;
  }

  accumulate(amount: number): void {
    this.points += Math.floor(amount);
  }

  redeem(points: number): void {
    if (points > this.points) {
      throw new Error('Insufficient points');
    }
    this.points -= points;
  }
}
