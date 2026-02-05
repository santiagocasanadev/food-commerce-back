import { LoyaltyRepository } from '../domain/loyalty.repository';
import { LoyaltyAccount } from '../domain/loyalty-account.entity';
import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';

export class SqliteLoyaltyRepository implements LoyaltyRepository {

  async findByCustomer(customerId: string): Promise<LoyaltyAccount> {
    const row = sqliteDb.prepare(`
      SELECT customer_id, points
      FROM loyalty_accounts
      WHERE customer_id = ?
    `).get(customerId);

    if (!row) {
      const account = new LoyaltyAccount(customerId, 0);
      await this.save(account);
      return account;
    }

    return new LoyaltyAccount(row.customer_id, row.points);
  }

  async save(account: LoyaltyAccount): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO loyalty_accounts (customer_id, points)
      VALUES (?, ?)
      ON CONFLICT(customer_id) DO UPDATE SET
        points = excluded.points
    `).run(account.customerId, account.getPoints());
  }
}
