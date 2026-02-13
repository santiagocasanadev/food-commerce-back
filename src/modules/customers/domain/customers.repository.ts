import { Customer } from "./customers.entity";
import { PoolClient } from "pg";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  save(customer: Customer, client?: PoolClient): Promise<void>;
  findByEmail(email: string): Promise<Customer | null>;
  createFromGoogle(data: { email: string; name: string; googleId: string; }): Promise<Customer>;
}
