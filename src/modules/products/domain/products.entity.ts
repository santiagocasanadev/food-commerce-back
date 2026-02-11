export class Product {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    private basePrice: number,
    private status: boolean,
    readonly catalogId: string
  ) {}

  getBasePrice() { return this.basePrice; }
  getStatus() { return this.status; }  

  activate() { this.status = true; }
  deactivate() { this.status = false; }
  changePrice(price: number) { this.basePrice = price; }
}
