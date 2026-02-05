import { PoolClient } from 'pg';
import { LoyaltyAccount } from "./loyalty-account.entity";



export interface LoyaltyRepository {
  findByCustomer(customerId: string): Promise<LoyaltyAccount>;
  save(account: LoyaltyAccount, client?:PoolClient): Promise<void>;
}
