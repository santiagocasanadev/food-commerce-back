import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { Customer } from '../domain/customers.entity';
import { CustomerRepository } from '../domain/customers.repository';

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
}
