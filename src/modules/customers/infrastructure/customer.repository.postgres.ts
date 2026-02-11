import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { Customer } from '../domain/customers.entity';
import { CustomerRepository } from '../domain/customers.repository';
import { PoolClient } from 'pg';

export class PostgresCustomerRepository implements CustomerRepository {

  async findById(id: string): Promise<Customer | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, name, email, address
      FROM customers WHERE id = $1
      `,
      [id]
    );

    const r = rows[0];
    return r ? new Customer(r.id, r.name, r.email, r.address) : null;
  }

  async save(customer: Customer, client?: PoolClient): Promise<void> {

  const executor = client ?? getPgPool();

  await executor.query(
    `
    INSERT INTO customers (id,name,email,address)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id)
    DO UPDATE SET
      name=$2,
      email=$3,
      address=$4
    `,
    [
      customer.id,
      customer.name,
      customer.email,
      customer.address
    ]
  );
}

}
