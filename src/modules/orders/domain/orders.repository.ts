import { Order } from "./orders.entity";
import { PoolClient } from "pg";

export interface OrderRepository {
  save(order: Order, client?:PoolClient): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
}
