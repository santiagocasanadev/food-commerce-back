import { Customer } from "../domain/customers.entity";
import { CustomerRepository } from "../domain/customers.repository";


export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>([
    ['c1', new Customer('c1', 'Juan Perez', 'juan@mail.com', 'Lima')],
  ]);

  async findById(id: string): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }
}
