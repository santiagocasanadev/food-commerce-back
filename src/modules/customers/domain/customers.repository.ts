import { Role } from "src/security/roles.enum";
import { Customer } from "./customers.entity";
import { PoolClient } from "pg";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  create(data: {userId: string; role: Role; }): Promise<Customer>;
  save(customer: Customer, client?: PoolClient): Promise<void>;
}
