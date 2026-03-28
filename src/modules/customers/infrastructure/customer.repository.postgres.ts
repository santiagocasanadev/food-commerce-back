import * as crypto from 'crypto';
import { Role } from 'src/security/roles.enum';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { Customer } from '../domain/customers.entity';
import { CustomerRepository } from '../domain/customers.repository';
import { PoolClient } from 'pg';

export class PostgresCustomerRepository implements CustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, user_id, role
      FROM customers WHERE id = $1
      `,
      [id]
    );

    const r = rows[0];
    return r ? new Customer(r.id, r.user_id, r.role) : null;
  }

  async findByUserId(userId: string): Promise<Customer | null> {

    const { rows } = await getPgPool().query(
      `
      SELECT id, user_id, role
      FROM customers
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) return null;

    const r = rows[0];

    return new Customer(
      r.id,
      r.user_id,
      r.role
    );
  }

  async save(customer: Customer, client?: PoolClient): Promise<void> {
    const executor = client ?? getPgPool();

    await executor.query(
      `
      INSERT INTO customers (id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        role = EXCLUDED.role
      `,
      [
        customer.id,
        customer.userId,
        customer.role
      ]
    );
  }

  async create(data: {
    userId: string;
    role: Role;
  }): Promise<Customer> {

    const id = crypto.randomUUID();

    await getPgPool().query(
      `
      INSERT INTO customers (id, user_id, role)
      VALUES ($1, $2, $3)
      `,
      [id, data.userId, data.role]
    );

    return new Customer(
      id,
      data.userId,
      data.role
    );
  }

}
