export class OrderItem {
  constructor(
    readonly productId: string,
    readonly quantity: number,
    readonly unitPrice: number
  ) {}
}
