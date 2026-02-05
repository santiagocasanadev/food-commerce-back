export class Product {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    private basePrice: number,
    private active: boolean,
    readonly catalogId: string
  ) {}

  activate() { this.active = true; }
  desactivate() { this.active = false; }
  changePrice(price: number) { this.basePrice = price; }

  isActive() { return this.active; }
  getPrice() { return this.basePrice; }
}
