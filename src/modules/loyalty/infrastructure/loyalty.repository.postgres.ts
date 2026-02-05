import { LoyaltyRepository } from '../domain/loyalty.repository';
import { LoyaltyAccount } from '../domain/loyalty-account.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';

export class PostgresLoyaltyRepository implements LoyaltyRepository {

  async findByCustomer(customerId: string): Promise<LoyaltyAccount> {
    const { rows } = await getPgPool().query(
      'SELECT customer_id, points FROM loyalty_accounts WHERE customer_id = $1',
      [customerId]
    );

    if (!rows[0]) {
      const account = new LoyaltyAccount(customerId, 0);
      await this.save(account);
      return account;
    }

    return new LoyaltyAccount(rows[0].customer_id, rows[0].points);
  }

  async save(account: LoyaltyAccount, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO loyalty_accounts (customer_id, points)
      VALUES ($1,$2)
      ON CONFLICT (customer_id)
      DO UPDATE SET points = $2
      `,
      [account.customerId, account.getPoints()]
    );
  }
}
