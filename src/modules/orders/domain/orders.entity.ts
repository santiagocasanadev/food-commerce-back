import { OrderItem } from './order-item.entity';

export type OrderStatus =
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED';

export class Order {
  constructor(
    readonly id: string,
    readonly customerId: string,
    private status: OrderStatus,
    readonly items: OrderItem[],
    readonly total: number,
    readonly createdAt: Date
  ) {}

  getStatus(): OrderStatus {
    return this.status;
  }

  advanceStatus(): void {
    const flow: OrderStatus[] = ['PAID', 'PREPARING', 'READY', 'DELIVERED'];
    const index = flow.indexOf(this.status);
    if (index === -1 || index === flow.length - 1) {
      throw new Error('Invalid status transition');
    }
    this.status = flow[index + 1];
  }
}
