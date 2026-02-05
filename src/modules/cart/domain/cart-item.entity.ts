export class CartItem {
  constructor(
    readonly productId: string,
    readonly quantity: number,
    readonly unitPrice: number
  ) {}
}