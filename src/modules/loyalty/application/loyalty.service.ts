import { Inject } from '@nestjs/common';
import type { LoyaltyRepository } from '../domain/loyalty.repository';

export class LoyaltyService {
  constructor(
    @Inject('LoyaltyRepository')
    private readonly repository: LoyaltyRepository
  ) {}

  async get(customerId: string) {
    return this.repository.findByCustomer(customerId);
  }

  async accumulate(customerId: string, amount: number): Promise<void> {
    const account = await this.repository.findByCustomer(customerId);
    account.accumulate(amount);
    await this.repository.save(account);
  }

  async redeem(customerId: string, points: number): Promise<void> {
    const account = await this.repository.findByCustomer(customerId);
    account.redeem(points);
    await this.repository.save(account);
  }

  async adjust(customerId: string, points: number) {
    const account = await this.repository.findByCustomer(customerId);
    account.redeem(-points);
    await this.repository.save(account);
  }
}
