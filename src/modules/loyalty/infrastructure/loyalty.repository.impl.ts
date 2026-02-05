import { LoyaltyAccount } from "../domain/loyalty-account.entity";
import { LoyaltyRepository } from "../domain/loyalty.repository";


export class InMemoryLoyaltyRepository implements LoyaltyRepository {
  private readonly store = new Map<string, LoyaltyAccount>();

  async findByCustomer(customerId: string): Promise<LoyaltyAccount> {
    if (!this.store.has(customerId)) {
      this.store.set(customerId, new LoyaltyAccount(customerId));
    }
    return this.store.get(customerId)!;
  }

  async save(account: LoyaltyAccount): Promise<void> {
    this.store.set(account.customerId, account);
  }
}
