import { Order } from "./orders.entity";
import { PoolClient } from "pg";

export interface OrderRepository {
  save(order: Order, client?:PoolClient): Promise<void>;
  findById(orderId: string, client?:PoolClient): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  findByCustomerPaginated(customerId: string, page: number, limit: number): Promise<{ data: Order[]; total: number }>
}
