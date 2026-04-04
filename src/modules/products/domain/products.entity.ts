export class Product {
  constructor(
    readonly id: string,
    private name: string,
    private description: string | null,
    private basePrice: number,
    private status: boolean,
    private catalogId: string
  ) {}

  getName() { return this.name; }
  getDescription() { return this.description; }
  getBasePrice() { return this.basePrice; }
  getStatus() { return this.status; }
  getCatalogId() { return this.catalogId; }

  activate() { this.status = true; }
  deactivate() { this.status = false; }
  changePrice(price: number) { this.basePrice = price; }
  updateDetails(input: {
    name?: string;
    description?: string | null;
    basePrice?: number;
    catalogId?: string;
  }) {
    if (input.name !== undefined) {
      this.name = input.name;
    }
    if (input.description !== undefined) {
      this.description = input.description;
    }
    if (input.basePrice !== undefined) {
      this.basePrice = input.basePrice;
    }
    if (input.catalogId !== undefined) {
      this.catalogId = input.catalogId;
    }
  }
}
