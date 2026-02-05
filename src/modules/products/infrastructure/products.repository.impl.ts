/*import { ProductsRepository } from '../domain/products.repository';
import { Product } from '../domain/products.entity';

export class InMemoryProductsRepository implements ProductsRepository {
    private readonly products = [
        new Product('p1', 'Bowl Proteico', 'Alto en proteína', 25, true, '2'),
        new Product('p2', 'Ensalada Vegana', '100% vegetal', 18, true, '1'),
    ];

    async findAll(): Promise<Product[]> {
        return this.products.filter(p => p.active);
    }
    async findById(id: string): Promise<Product | null> {
        return this.products.find(p => p.id === id) ?? null;
    }
}
*/