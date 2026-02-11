export class Inventory {
  constructor(
    readonly productId: string,
    private availableQuantity: number,
    private reservedQuantity: number
  ) {}

  getAvailable(): number {
    return this.availableQuantity;
  }

  getReserved(): number {
    return this.reservedQuantity;
  }

  canReserve(quantity: number): boolean {
    return this.availableQuantity >= quantity;
  }

  reserve(quantity: number): void {
    if (!this.canReserve(quantity)) {
      throw new Error('Insufficient stock');
    }
    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
  }

  adjust(quantity: number): void {
    this.availableQuantity += quantity;
    if (this.availableQuantity < 0) {
      this.availableQuantity = 0;
    }
  }
}
