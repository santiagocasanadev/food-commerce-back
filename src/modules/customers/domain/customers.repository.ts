import { Customer } from "./customers.entity";
import { PoolClient } from "pg";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  save(customer: Customer, client?: PoolClient): Promise<void>;
}
