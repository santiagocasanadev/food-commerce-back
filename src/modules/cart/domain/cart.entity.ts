import { CartItem } from './cart-item.entity';

export class Cart {
  constructor(
    readonly id: string,
    readonly customerId: string,
    private status: 'ACTIVE' | 'CHECKED_OUT',
    private items: CartItem[] = []
  ) {}

  addItem(item: CartItem) {
    if (this.status !== 'ACTIVE') {
      throw new Error('Cart not active');
    }
    this.items.push(item);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  checkout() {
    this.status = 'CHECKED_OUT';
  }
}
