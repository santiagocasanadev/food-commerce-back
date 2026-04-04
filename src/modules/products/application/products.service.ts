import type { ProductsRepository } from '../domain/products.repository';
import { Product } from '../domain/products.entity';
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import type { CatalogRepository } from 'src/modules/catalog/domain/catalog.repository';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
	constructor(
		@Inject('ProductsRepository')
		private readonly repository: ProductsRepository,
		@Inject('CatalogRepository')
		private readonly catalogRepository: CatalogRepository,
	) {}

	async list(): Promise<Product[]> {
		const products = await this.repository.findAll();
		return products.filter((product) => product.getStatus());
	}

	async getById(id: string): Promise<Product | null> {
		const product = await this.repository.findById(id);
		if (!product || !product.getStatus()) {
			return null;
		}
		return product;
	}

	async listAdmin() {
		return this.repository.findAll();
	}

	async activate(id: string) {
		const p = await this.mustFind(id);
		p.activate();
		await this.repository.save(p);
		return p;
	}

	async deactivate(id: string) {
		const p = await this.mustFind(id);
		p.deactivate();
		await this.repository.save(p);
		return p;
	}

	async changePrice(id: string, price: number) {
		if (price < 0) {
			throw new BadRequestException('Product price must be zero or greater');
		}

		const p = await this.mustFind(id);
		p.changePrice(price);
		await this.repository.save(p);
		return p;
	}

	async create(input: {
		id?: string;
		name: string;
		description?: string | null;
		basePrice: number;
		catalogId: string;
	}) {
		await this.assertCatalogExists(input.catalogId);

		const name = input.name?.trim();

		if (!name) {
			throw new BadRequestException('Product name is required');
		}

		if (input.basePrice < 0) {
			throw new BadRequestException('Product price must be zero or greater');
		}

		const product = new Product(
			input.id?.trim() || crypto.randomUUID(),
			name,
			input.description?.trim() ?? null,
			input.basePrice,
			true,
			input.catalogId,
		);

		await this.repository.save(product);
		return product;
	}

	async update(id: string, input: {
		name?: string;
		description?: string | null;
		basePrice?: number;
		catalogId?: string;
	}) {
		const product = await this.mustFind(id);

		if (input.catalogId !== undefined) {
			await this.assertCatalogExists(input.catalogId);
		}

		if (input.name !== undefined && !input.name.trim()) {
			throw new BadRequestException('Product name cannot be empty');
		}

		if (input.basePrice !== undefined && input.basePrice < 0) {
			throw new BadRequestException('Product price must be zero or greater');
		}

		product.updateDetails({
			name: input.name?.trim(),
			description: input.description === undefined ? undefined : input.description?.trim() ?? null,
			basePrice: input.basePrice,
			catalogId: input.catalogId,
		});

		await this.repository.save(product);
		return product;
	}

	async remove(id: string) {
		await this.mustFind(id);
		await this.repository.deleteById(id);
		return { success: true };
	}

	private async mustFind(id: string) {
		const product = await this.repository.findById(id);
		if (!product) {
			throw new NotFoundException('Product not found');
		}
		return product;
	}

	private async assertCatalogExists(catalogId: string) {
		const catalog = await this.catalogRepository.findById(catalogId);
		if (!catalog) {
			throw new BadRequestException('Catalog not found for product');
		}
	}
}
