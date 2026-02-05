import { Order } from "../domain/orders.entity";
import { OrderRepository } from "../domain/orders.repository";


export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.store.get(orderId) ?? null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.store.values());
  }
}
