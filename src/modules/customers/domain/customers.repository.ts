import { Customer } from "./customers.entity";


export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
}
