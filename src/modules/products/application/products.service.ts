import type { ProductsRepository } from '../domain/products.repository';
import { Product } from '../domain/products.entity';
import { Inject } from '@nestjs/common';

export class ProductsService {
	constructor(
		@Inject('ProductsRepository')
		private readonly repository: ProductsRepository
	) {}

	list(): Promise<Product[]> {
		return this.repository.findAll();
	}

	getById(id: string): Promise<Product | null> {
		return this.repository.findById(id);
	}

	async listAdmin() {
		return this.repository.findAll();
	}

	async activate(id: string) {
		const p = await this.repository.findById(id);
		if (!p) throw new Error('Product not found');
		p.activate();
		await this.repository.save(p);
	}

	async deactivate(id: string) {
		const p = await this.repository.findById(id);
		if (!p) throw new Error('Product not found');
		p.deactivate();
		await this.repository.save(p);
	}

	async changePrice(id: string, price: number) {
		const p = await this.repository.findById(id);
		if (!p) throw new Error('Product not found');
		p.changePrice(price);
		await this.repository.save(p);
	}
}
