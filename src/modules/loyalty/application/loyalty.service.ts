import { Inject } from '@nestjs/common';
import type { LoyaltyRepository } from '../domain/loyalty.repository';

export class LoyaltyService {

  private readonly EARN_RATE = 0.1;

  constructor(
    @Inject('LoyaltyRepository')
    private readonly repository: LoyaltyRepository
  ) {}

  async get(customerId: string) {
    return this.repository.findByCustomer(customerId);
  }

  async accumulate(customerId: string, amount: number): Promise<void> {
    const account = await this.repository.findByCustomer(customerId);
    account.addPoints(amount);
    await this.repository.save(account);
  }

  async redeem(customerId: string, points: number): Promise<void> {
    const account = await this.repository.findByCustomer(customerId);
    account.subtractPoints(points);
    await this.repository.save(account);
  }

  async adjust(customerId: string, points: number) {
    const account = await this.repository.findByCustomer(customerId);
    account.subtractPoints(-points);
    await this.repository.save(account);
  }

  calculatePointsEarned(totalPaid: number): number {
    return Math.floor(totalPaid * this.EARN_RATE);
  }
}
