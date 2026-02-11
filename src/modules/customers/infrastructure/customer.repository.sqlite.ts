import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';
import { Customer } from '../domain/customers.entity';
import { CustomerRepository } from '../domain/customers.repository';

export class SqliteCustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const row = sqliteDb.prepare(`
      SELECT id, name, email, address
      FROM customers
      WHERE id = ?
    `).get(id);
    
    return row
      ? new Customer(row.id, row.name, row.email, row.address)
      : null;
  }
}
