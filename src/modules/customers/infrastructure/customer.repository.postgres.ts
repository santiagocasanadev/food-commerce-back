import { Role } from 'src/security/roles.enum';
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
    return r ? new Customer(r.id, r.name, r.email, r.address, r.google_id, r.role) : null;
  }

  async save(customer: Customer, client?: PoolClient): Promise<void> {

  const executor = client ?? getPgPool();

  await executor.query(
    `
    INSERT INTO customers (id,name,email,address,google_id,role)
    VALUES ($1,$2,$3,$4,$5,$6)
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

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await getPgPool().query(
      `
    SELECT * FROM customers
    WHERE email = $1
    LIMIT 1
    `,
      [email]
    );

    if (!result.rows.length) return null;

    const row = result.rows[0];

    return new Customer(
      row.id,
      row.name,
      row.email,
      row.address,
      row.google_id,
      row.role
    );
  }


  async createFromGoogle(data: {
    email: string;
    name: string;
    googleId: string;
    role: Role;
  }): Promise<Customer> {

    const id = crypto.randomUUID();

    await getPgPool().query(
      `
    INSERT INTO customers (id, name, email, google_id, role)
    VALUES ($1, $2, $3, $4, $5)
    `,
      [id, data.name, data.email, data.googleId, data.role]
    );

    return new Customer(
      id,
      data.name,
      data.email,
      null,
      data.googleId,
      data.role
    );
  }

}
