import { PoolClient } from 'pg';
import { LoyaltyAccount } from "./loyalty-account.entity";



export interface LoyaltyRepository {
  findByCustomer(customerId: string, client?: PoolClient): Promise<LoyaltyAccount>;
  save(account: LoyaltyAccount, client?:PoolClient): Promise<void>;
}
