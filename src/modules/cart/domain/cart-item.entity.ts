export class CartItem {
  constructor(
    readonly productId: string,
    private quantity: number,
    readonly unitPrice: number
  ) {}

  getQuantity() {
    return this.quantity;
  }

  increaseQuantity(qty: number) {
    this.quantity += qty;
  }
}