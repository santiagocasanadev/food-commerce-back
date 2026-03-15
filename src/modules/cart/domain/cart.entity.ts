import { BadRequestException, Logger } from '@nestjs/common';
import { CartItem } from './cart-item.entity';
export type CartStatus = 'ACTIVE' | 'CHECKED_OUT';

export class Cart {
  constructor(
    readonly id: string,
    private customerId: string | null,
    private guestId: string | null,
    private status: CartStatus,
    private items: CartItem[] = []
  ) {
    if (!customerId && !guestId) {
      throw new BadRequestException('Cart must belong to customer or guest');
    }
  }

  getCustomerId() {
    return this.customerId;
  }

  getGuestId() {
    return this.guestId;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  getStatus() {
    return this.status;
  }
  
  getItems(): CartItem[] {
    return this.items;
  }

  addItem(item: CartItem) {
    const existing = this.items.find(
      i => i.productId === item.productId
    );

    if (existing) {
      existing.increaseQuantity(item.getQuantity());
    } else {
      this.items.push(item);
    }
  }

  merge(other: Cart) {
    for (const item of other.getItems()) {
      this.addItem(new CartItem(
        item.productId,
        item.getQuantity(),
        item.unitPrice
      ));
    }
  }

  assignCustomer(customerId: string) {
    if (!this.isActive()) {
      throw new Error('Cannot assign customer to inactive cart');
    }
    this.customerId = customerId;
    this.guestId = null;
  }

  clear() {

    if (!this.isActive()) {
      throw new Error('Cart not active');
    }

    this.items = [];

  }

  checkout() {
    this.status = 'CHECKED_OUT';
  }
}
