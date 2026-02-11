import { PoolClient } from 'pg';
import { getPgPool } from './postgres.connection';

export class UnitOfWork {

  async execute<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {

    const pool = getPgPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
